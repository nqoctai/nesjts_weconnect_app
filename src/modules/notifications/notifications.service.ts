import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from 'src/modules/notifications/entities/notification.entity';
import { Repository } from 'typeorm';
import { IUser } from 'src/modules/users/user.interface';
import { UsersService } from 'src/modules/users/users.service';
import { NotificationType } from 'src/modules/notifications/notification.type.enum';
import { User } from 'src/modules/users/entities/user.entity';
import { Post } from 'src/modules/posts/entities/post.entity';
import { Like } from 'src/modules/likes/entities/like.entity';
import { Comment } from 'src/modules/comments/entities/comment.entity';
import { Friend } from 'src/modules/friends/entities/friend.entity';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>,
    private readonly userService: UsersService,
  ) { }

  create(createNotificationDto: CreateNotificationDto) {

    return 'This action adds a new notification';
  }

  async findAllPaginated(page: number, size: number, user: IUser) {
    const userDB = await this.userService.findOneByUserName(user.email);
    if (!userDB) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const skip = (Number(page) - 1) * Number(size);
    const [res, total] = await this.notificationRepository.findAndCount({
      where: { user: userDB },
      take: size || 10,
      skip: +skip || 0,
      order: { createdAt: 'DESC' },
    });

    const notifications = res.map((notification) => {
      let content = "";
      if (notification.type === NotificationType.POST_LIKED) {
        content = `${notification.user.name} liked your post`;
      } else if (notification.type === NotificationType.POST_COMMENTED
      ) {
        content = `${notification.user.name} commented on your post`;
      } else if (notification.type === NotificationType.FRIEND_REQUEST) {
        content = `${notification.user.name} sent you a friend request`;
      } else if (notification.type === NotificationType.FRIEND_REQUEST_ACCEPTED) {
        content = `${notification.user.name} accepted your friend request`;
      }
      return {
        id: notification.id,
        content: content,
        type: notification.type,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
        userId: notification.user.id,
        postId: notification.post ? notification.post.id : null,
        commentId: notification.comment ? notification.comment.id : null,
        friendId: notification.friend ? notification.friend.id : null,
        likeId: notification.like ? notification.like.id : null,
        userName: notification.user.name,

      };
    })

    return {
      meta: {
        page: page,
        size: size,
        pages: Math.ceil(total / size),
        total: total,
      },
      result: notifications,
    };
  }

  async countAllUnread(user: IUser) {
    const { email } = user;
    const userDB = await this.userService.findOneByUserName(email);
    if (!userDB) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    return this.notificationRepository.count({ where: { user: userDB, isRead: false } });

  }

  async markAsRead(id: string, user: IUser) {
    const res = await this.notificationRepository.update(id, { isRead: true })
    if (res.affected === 0) {
      throw new HttpException('Notification not found', HttpStatus.BAD_REQUEST);
    }
    return res;
  }

  async markAllAsRead() {
    return this.notificationRepository.update({ isRead: false }, { isRead: true });
  }

  async createPostLikedNotification(postOwner: User, likedPost: Post, liker: User, like: Like) {
    if (postOwner.id === liker.id) {
      return null;
    }

    const notification: Notification = new Notification();
    notification.user = postOwner;
    notification.type = NotificationType.POST_LIKED;
    notification.post = likedPost;
    notification.like = like;
    notification.isRead = false;

    return this.notificationRepository.save(notification);
  }

  async createPostCommentedNotification(postOwner: User, commentedPost: Post, comment: Comment, commenter: User) {
    if (postOwner.id === commenter.id) {
      return null;
    }

    const notification: Notification = new Notification();
    notification.user = postOwner;
    notification.type = NotificationType.POST_COMMENTED;
    notification.post = commentedPost;
    notification.comment = comment;
    notification.isRead = false;

    return this.notificationRepository.save(notification);
  }

  async createFriendRequestNotification(receiver: User, friendRequest: Friend) {
    const notification: Notification = new Notification();
    notification.user = receiver;
    notification.type = NotificationType.FRIEND_REQUEST;
    notification.friend = friendRequest;
    notification.isRead = false;

    return this.notificationRepository.save(notification);
  }

  async createFriendAcceptedNotification(receiver: User, friendRequest: Friend) {
    const notification: Notification = new Notification();
    notification.user = receiver;
    notification.type = NotificationType.FRIEND_REQUEST_ACCEPTED;
    notification.friend = friendRequest;
    notification.isRead = false;

    return this.notificationRepository.save(notification);

  }


}
