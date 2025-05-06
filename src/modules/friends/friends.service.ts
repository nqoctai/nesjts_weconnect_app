import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { IUser } from 'src/modules/users/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Friend } from 'src/modules/friends/entities/friend.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/modules/users/users.service';
import { User } from 'src/modules/users/entities/user.entity';
import { FriendStatus } from 'src/modules/friends/friends.status.enum';
import { NotificationsService } from 'src/modules/notifications/notifications.service';

@Injectable()
export class FriendsService {
  constructor(@InjectRepository(Friend) private readonly friendRepository: Repository<Friend>,
    private readonly userService: UsersService,
    private readonly notificationService: NotificationsService,
  ) { }

  async sendRequest(createFriendDto: CreateFriendDto, user: IUser) {
    const { email } = user;
    const { receiverId } = createFriendDto;

    const currentUser = await this.userService.findOneByUserName(email);
    if (!currentUser) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    const userReceiver: User | null = await this.userService.findOne(+receiverId);
    if (!userReceiver) {
      throw new HttpException('Receiver not found', HttpStatus.BAD_REQUEST);
    }
    if (currentUser.id === userReceiver.id) {
      throw new HttpException('You cannot send a friend request to yourself', HttpStatus.BAD_REQUEST);
    }

    const existFriendRequestPending = await this.friendRepository.findOne({
      where: {
        sender: currentUser,
        receiver: userReceiver,
        status: FriendStatus.PENDING
      }
    })
    if (existFriendRequestPending) {
      throw new HttpException('Friend request already sent', HttpStatus.BAD_REQUEST);
    }

    const existFriendRequestAccepted = await this.friendRepository.findOne({
      where: {
        sender: currentUser,
        receiver: userReceiver,
        status: FriendStatus.ACCEPTED
      }
    })

    if (existFriendRequestAccepted) {
      throw new HttpException('You are already friends', HttpStatus.BAD_REQUEST);
    }

    let friend = await this.friendRepository.findOne({
      where: {
        sender: userReceiver,
        receiver: currentUser,
        status: FriendStatus.REJECTED
      }
    })

    if (friend) {
      friend.status = FriendStatus.PENDING;

    } else {
      friend = this.friendRepository.create({
        sender: currentUser,
        receiver: userReceiver,
        status: FriendStatus.PENDING
      });

    }

    const friendDB = await this.friendRepository.save(friend);

    const friendResponse = {
      id: friendDB.id,
      sender: {
        id: friendDB.sender.id,
        name: friendDB.sender.name,
        email: friendDB.sender.email,
        phone: friendDB.sender.phone,
        avatar: friendDB.sender.avatar,
      },
      receiver: {
        id: friendDB.receiver.id,
        name: friendDB.receiver.name,
        email: friendDB.receiver.email,
        phone: friendDB.receiver.phone,
        avatar: friendDB.receiver.avatar,
      },
      status: friendDB.status,
      createdAt: friendDB.createdAt,
      updatedAt: friendDB.updatedAt,
    }

    this.notificationService.createFriendRequestNotification(userReceiver, friendDB)
    return friendResponse;
  }

  async acceptRequest(friendRequestId: number, user: IUser) {
    const { email } = user;
    const currentUser = await this.userService.findOneByUserName(email);
    if (!currentUser) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const friendRequest = await this.friendRepository.findOne({
      where: {
        id: friendRequestId,
        receiver: currentUser,
        status: FriendStatus.PENDING
      },
      relations: ['sender', 'receiver']
    })

    if (!friendRequest) {
      throw new HttpException('Friend request not found', HttpStatus.BAD_REQUEST);
    }

    friendRequest.status = FriendStatus.ACCEPTED;
    const friendDB = await this.friendRepository.save(friendRequest);

    const friendResponse = {
      id: friendDB.id,
      sender: {
        id: friendDB.sender.id,
        name: friendDB.sender.name,
        email: friendDB.sender.email,
        phone: friendDB.sender.phone,
        avatar: friendDB.sender.avatar,
      },
      receiver: {
        id: friendDB.receiver.id,
        name: friendDB.receiver.name,
        email: friendDB.receiver.email,
        phone: friendDB.receiver.phone,
        avatar: friendDB.receiver.avatar,
      },
      status: friendDB.status,
      createdAt: friendDB.createdAt,
      updatedAt: friendDB.updatedAt,
    }

    this.notificationService.createFriendAcceptedNotification(friendDB.sender, friendDB)
    return friendResponse;
  }

  async rejectRequest(friendRequestId: number, user: IUser) {
    const { email } = user;
    const currentUser = await this.userService.findOneByUserName(email);
    if (!currentUser) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const friendRequest = await this.friendRepository.findOne({
      where: {
        id: friendRequestId,
        receiver: currentUser,
        status: FriendStatus.PENDING
      },
      relations: ['sender', 'receiver']
    })

    if (!friendRequest) {
      throw new HttpException('Friend request not found', HttpStatus.BAD_REQUEST);
    }

    friendRequest.status = FriendStatus.REJECTED;
    const friendDB = await this.friendRepository.save(friendRequest);

    const friendResponse = {
      id: friendDB.id,
      sender: {
        id: friendDB.sender.id,
        name: friendDB.sender.name,
        email: friendDB.sender.email,
        phone: friendDB.sender.phone,
        avatar: friendDB.sender.avatar,
      },
      receiver: {
        id: friendDB.receiver.id,
        name: friendDB.receiver.name,
        email: friendDB.receiver.email,
        phone: friendDB.receiver.phone,
        avatar: friendDB.receiver.avatar,
      },
      status: friendDB.status,
      createdAt: friendDB.createdAt,
      updatedAt: friendDB.updatedAt,
    }

    return friendResponse;
  }

  async getReceivedFriendRequests(user: IUser) {
    const { email } = user;
    const currentUser = await this.userService.findOneByUserName(email);
    if (!currentUser) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const friendRequests = await this.friendRepository.find({
      where: {
        receiver: currentUser,
        status: FriendStatus.PENDING
      },
      relations: ['sender', 'receiver']
    })

    return friendRequests.map(friendRequest => {
      return {
        id: friendRequest.id,
        sender: {
          id: friendRequest.sender.id,
          name: friendRequest.sender.name,
          email: friendRequest.sender.email,
          phone: friendRequest.sender.phone,
          avatar: friendRequest.sender.avatar,
        },
        receiver: {
          id: friendRequest.receiver.id,
          name: friendRequest.receiver.name,
          email: friendRequest.receiver.email,
          phone: friendRequest.receiver.phone,
          avatar: friendRequest.receiver.avatar,
        },
        status: friendRequest.status,
        createdAt: friendRequest.createdAt,
        updatedAt: friendRequest.updatedAt,
      }
    })

  }

  async getFriends(user: IUser) {
    const { email } = user;
    const currentUser = await this.userService.findOneByUserName(email);
    if (!currentUser) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const friends = await this.friendRepository.find({
      where: {
        status: FriendStatus.ACCEPTED,
        receiver: currentUser
      },
      relations: ['sender', 'receiver']
    })

    return friends.map(friend => {
      return {
        id: friend.id,
        sender: {
          id: friend.sender.id,
          name: friend.sender.name,
          email: friend.sender.email,
          phone: friend.sender.phone,
          avatar: friend.sender.avatar,
        },
        receiver: {
          id: friend.receiver.id,
          name: friend.receiver.name,
          email: friend.receiver.email,
          phone: friend.receiver.phone,
          avatar: friend.receiver.avatar,
        },
        status: friend.status,
        createdAt: friend.createdAt,
        updatedAt: friend.updatedAt,
      }
    })



  }
}
