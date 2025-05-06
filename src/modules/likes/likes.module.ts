import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { UsersModule } from 'src/modules/users/users.module';
import { PostsModule } from 'src/modules/posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationsModule } from 'src/modules/notifications/notifications.module';
import { Like } from 'src/modules/likes/entities/like.entity';


@Module({
  imports: [UsersModule, PostsModule, TypeOrmModule.forFeature([Like]), NotificationsModule],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule { }
