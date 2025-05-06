import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/modules/users/user.interface';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @Post("/posts/:postId/comments")
  @ResponseMessage("Add comment to post")
  addComment(@Param("postId") postId: string, @Body() createCommentDto: CreateCommentDto, @User() user: IUser) {
    return this.commentsService.addComment(postId, createCommentDto, user);
  }

  @Get("/posts/:postId/comments")
  @ResponseMessage("Get post comments")
  getPostComments(@Param("postId") postId: string) {
    return this.commentsService.getPostComments(postId);
  }

  @Get("/posts/:postId/comments/paginated")
  @ResponseMessage("Get post comments paginated")
  getPostCommentsPaginated(@Param("postId") postId: string, @Query("page") page: number, @Query("size") size: number) {
    return this.commentsService.getPostCommentsPaginated(postId, page, size);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(+id);
  }

  @Put('/comments/:id')
  @ResponseMessage("Update comment")
  update(@Param('id') id: string, @Body() updateCommentDto: CreateCommentDto, @User() user: IUser) {
    return this.commentsService.update(+id, updateCommentDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.commentsService.remove(+id, user);
  }
}
