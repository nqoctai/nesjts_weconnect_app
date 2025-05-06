import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { IUser } from 'src/modules/users/user.interface';
import { UsersService } from 'src/modules/users/users.service';
import { PostsService } from 'src/modules/posts/posts.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/modules/comments/entities/comment.entity';
import { Repository } from 'typeorm';
import { NotificationsService } from 'src/modules/notifications/notifications.service';

@Injectable()
export class CommentsService {
  constructor(private readonly userService: UsersService,
    private readonly postService: PostsService,
    @InjectRepository(Comment) private readonly likeRepository: Repository<Comment>,
    private readonly notificationService: NotificationsService,
  ) { }

  async addComment(postId: string, createCommentDto: CreateCommentDto, user: IUser) {
    const { content } = createCommentDto;
    const { email } = user;

    const userDB = await this.userService.findOneByUserName(email);
    if (!userDB) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const postDB = await this.postService.findOne(+postId);
    if (!postDB) {
      throw new HttpException('Post not found', HttpStatus.BAD_REQUEST);
    }

    let comment = new Comment();
    comment.content = content;
    comment.user = userDB;
    comment.post = postDB;
    comment = await this.likeRepository.save(comment);

    if (!(userDB.id === postDB.user.id)) {
      this.notificationService.createPostCommentedNotification(postDB.user, postDB, comment, userDB);
    }

    return comment;
  }

  async getPostComments(postId: string) {
    const postDB = await this.postService.findOne(+postId);
    if (!postDB) {
      throw new HttpException('Post not found', HttpStatus.BAD_REQUEST);
    }
    const comments = await this.likeRepository.find({
      where: { post: postDB },
      relations: ['user', 'post'],
    });
    return comments;
  }

  async getPostCommentsPaginated(postId: string, page: number, size: number) {
    const postDB = await this.postService.findOne(+postId);
    const skip = (page - 1) * size;
    if (!postDB) {
      throw new HttpException('Post not found', HttpStatus.BAD_REQUEST);
    }
    const [res, total] = await this.likeRepository.findAndCount({
      where: { post: postDB },
      take: size,
      skip: skip,
      relations: ['user', 'post'],
    });
    return {
      meta: {
        page: page,
        size: size,
        pages: Math.ceil(total / size),
        total: total,
      },
      result: res
    };
  }

  findAll() {
    return `This action returns all comments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  async update(id: number, updateCommentDto: CreateCommentDto, user: IUser) {
    const { content } = updateCommentDto;
    const { email } = user;
    const userDB = await this.userService.findOneByUserName(email);
    if (!userDB) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    const commentDB = await this.likeRepository.findOne({
      where: { id: id },
      relations: ['user'],
    });
    if (!commentDB) {
      throw new HttpException('Comment not found', HttpStatus.BAD_REQUEST);
    }
    if (commentDB.user.id !== userDB.id) {
      throw new HttpException('You are not the owner of this comment', HttpStatus.BAD_REQUEST);
    }
    commentDB.content = content;
    return this.likeRepository.update(id, commentDB);
  }

  async remove(id: number, user: IUser) {
    const { email } = user;
    const userDB = await this.userService.findOneByUserName(email);
    if (!userDB) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    const commentDB = await this.likeRepository.findOne({
      where: { id: id },
      relations: ['user'],
    });
    if (!commentDB) {
      throw new HttpException('Comment not found', HttpStatus.BAD_REQUEST);
    }
    if (commentDB.user.id !== userDB.id) {
      throw new HttpException('You are not the owner of this comment', HttpStatus.BAD_REQUEST);
    }
    return this.likeRepository.delete(commentDB);
  }


}
