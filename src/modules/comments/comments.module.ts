import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { UsersModule } from 'src/modules/users/users.module';
import { PostsModule } from 'src/modules/posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/modules/comments/entities/comment.entity';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';

@Module({
  imports: [UsersModule, PostsModule, TypeOrmModule.forFeature([Comment]), NotificationsModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule { }
