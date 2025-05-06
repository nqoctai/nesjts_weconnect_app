import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LikesService } from './likes.service';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/modules/users/user.interface';

@Controller()
export class LikesController {
  constructor(private readonly likesService: LikesService) { }

  @Post("/posts/:postId/like")
  @ResponseMessage("Like post successfully")
  likePost(@Param('postId') postId: string, @User() user: IUser) {
    return this.likesService.likePost(postId, user);
  }

  @Delete("/posts/:postId/unlike")
  @ResponseMessage("Unlike post successfully")
  unlikePost(@Param('postId') postId: string, @User() user: IUser) {
    return this.likesService.unlikePost(postId, user);
  }


}
