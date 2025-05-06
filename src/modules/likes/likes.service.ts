import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { IUser } from 'src/modules/users/user.interface';
import { UsersService } from 'src/modules/users/users.service';
import { Post } from 'src/modules/posts/entities/post.entity';
import { PostsService } from 'src/modules/posts/posts.service';
import { User } from 'src/modules/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from 'src/modules/likes/entities/like.entity';
import { NotificationsService } from 'src/modules/notifications/notifications.service';

@Injectable()
export class LikesService {
  constructor(private readonly userService: UsersService,
    private readonly postService: PostsService,
    @InjectRepository(Like) private readonly likeRepository: Repository<Like>,
    private readonly notificationService: NotificationsService) { }

  async likePost(postId: string, user: IUser) {
    const { email } = user;

    const userDB = await this.userService.findOneByUserName(email);
    if (!userDB) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const postDB: Post = await this.postService.findOne(+postId);

    const existingLike = await this.likeRepository.findOne({
      where: { user: userDB, post: postDB },
      relations: ['user', 'post'],
    })

    if (existingLike) {
      throw new HttpException('You already liked this post', HttpStatus.BAD_REQUEST);
    }

    let like = new Like();
    like.user = userDB;
    like.post = postDB;
    like = await this.likeRepository.save(like);

    this.notificationService.createPostLikedNotification(postDB.user, postDB, userDB, like);

    return like;
  }

  async unlikePost(postId: string, user: IUser) {
    const { email } = user;

    const userDB = await this.userService.findOneByUserName(email);
    console.log("userDB", userDB);
    if (!userDB) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const postDB: Post = await this.postService.findOne(+postId);
    console.log("postDB", postDB);
    const like = await this.likeRepository.findOne({
      where: { user: { id: userDB.id }, post: { id: postDB.id } }
    })
    if (!like) {
      throw new HttpException('You have not liked this post yet', HttpStatus.BAD_REQUEST);
    }

    return this.likeRepository.remove(like);
  }


}
