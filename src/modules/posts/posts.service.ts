import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/modules/posts/entities/post.entity';
import { Like, Repository } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { IUser } from 'src/modules/users/user.interface';

@Injectable()
export class PostsService {
  constructor(@InjectRepository(Post) private readonly postsRepository: Repository<Post>, @InjectRepository(User) private readonly userRepository: Repository<User>) { }

  async create(createPostDto: CreatePostDto, user: IUser) {
    console.log("user", user);
    const userDB = await this.userRepository.findOneBy({ id: +user.id });
    if (!userDB) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    const post = this.postsRepository.create({
      ...createPostDto,
      user: userDB,
      createdBy: user.email,
    });
    // const { id } = await this.postsRepository.save(post);
    // const result = await this.postsRepository.findOne({
    //   where: { id: id },
    //   relations: { user: true },
    //   select: {
    //     user: {
    //       id: true,
    //       name: true,
    //       email: true,
    //       createdAt: true,
    //     }
    //   }
    // });
    return await this.postsRepository.save(post);
  }

  async findAll(page: number, size: number, filter: string = "") {
    const skip = (Number(page) - 1) * Number(size);
    const [res, total] = await this.postsRepository.findAndCount(
      {
        order: {
          createdAt: 'DESC',
        },
        where: {
          content: Like(`%${filter}%`),
        },
        take: Number(size) || 10,
        skip: skip || 0,
        relations: { user: true, likes: { user: true }, comments: true },
        select: {
          id: true,
          content: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          user: {
            id: true,
            name: true,
            email: true,
            createdAt: true

          },
        }
      }
    )

    return {
      meta: {
        page: Number(page),
        pageSize: Number(size),
        pages: Math.ceil(total / Number(size)),
        total: total,
      },
      result: res,
    };
  }

  async findOne(id: number) {
    const res = await this.postsRepository.findOne({
      where: { id: id },
      relations: { user: true },
      select: {
        user: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        }
      }
    });
    if (!res) {
      throw new HttpException('Post not found', HttpStatus.BAD_REQUEST);
    }


    return res;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
