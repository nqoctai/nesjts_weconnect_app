import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from 'src/modules/users/entities/user.entity';
import { PostsModule } from './modules/posts/posts.module';
import { Post } from 'src/modules/posts/entities/post.entity';
import { FilesModule } from './modules/files/files.module';
import { LikesModule } from './modules/likes/likes.module';
import { CommentsModule } from './modules/comments/comments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FriendsModule } from './modules/friends/friends.module';
import { Like } from 'src/modules/likes/entities/like.entity';
import { Comment } from 'src/modules/comments/entities/comment.entity';
import { Notification } from 'src/modules/notifications/entities/notification.entity';
import { Friend } from 'src/modules/friends/entities/friend.entity';
import { EventGateway } from 'src/event.gateway';
import { MessageRoomMemberModule } from './modules/message.room.member/message.room.member.module';


@Module({
  imports: [AuthModule, UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DATABASE_HOST'),
        port: +configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME') || "root",
        password: configService.get('DATABASE_PASSWORD') || "123456",
        database: configService.get('DATABASE_NAME'),
        entities: [User, Post, Like, Comment, Notification, Friend],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    PostsModule,
    FilesModule,
    LikesModule,
    CommentsModule,
    NotificationsModule,
    FriendsModule,
    MessageRoomMemberModule,
  ],
  controllers: [AppController],
  providers: [AppService, EventGateway],
})
export class AppModule { }
