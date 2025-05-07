import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Not, Repository } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { hashPassword } from 'src/utils/brypt';
import { FriendStatus } from 'src/modules/friends/friends.status.enum';
import { IUser } from 'src/modules/users/user.interface';


@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }



  async create(createUserDto: CreateUserDto) {
    const existUser = await this.usersRepository.findOneBy({ email: createUserDto.email });
    if (existUser) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }

    const newPassword = hashPassword(createUserDto.password);
    createUserDto.password = newPassword;
    const user = this.usersRepository.create(createUserDto);

    const userDB = await this.usersRepository.save(user);
    return {
      id: userDB.id,
      name: userDB.name,
      email: userDB.email,
      createdAt: userDB.createdAt,
    };

  }

  async findAll(page: string, size: string, filter: string = "", myUser: IUser) {

    const skip = (Number(page) - 1) * Number(size);

    const [res, total] = await this.usersRepository.findAndCount(
      {
        where: {
          name: Like(`%${filter}%`),
          id: Not(+myUser.id),
        },
        take: Number(size) || 10,
        skip: skip || 0,
        relations: {
          friendRequestsSent: { receiver: true, sender: true },
          friendRequestsReceived: { receiver: true, sender: true },

        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        }
      }
    );

    const friendRequestsSent = res.map((user) => {
      let isFriend = false;
      let requestSent = false;
      let requestReceived = false;
      let friendsId: number | null = null;

      const friendRequestSent = user.friendRequestsSent.find((friend) => friend.receiver.id === +myUser.id);
      const friendRequestReceived = user.friendRequestsReceived.find((friend) => friend.sender.id === +myUser.id);
      if (friendRequestSent) {
        requestReceived = true;
        friendsId = friendRequestSent.id;
      }
      if (friendRequestReceived) {
        requestSent = true;
        friendsId = friendRequestReceived.id;
      }
      let friend = user.friendRequestsSent.find((friend) => (friend?.receiver.id === +myUser.id || friend?.sender.id === +myUser.id) && friend.status === FriendStatus.ACCEPTED);

      if (friend) {
        if (friend.sender.id !== +myUser.id) {
          isFriend = true;
          friendsId = friend.id;
          requestReceived = false;
          requestSent = false;
        }
      } else {
        friend = user.friendRequestsReceived.find((friend) => (friend?.receiver.id === +myUser.id || friend?.sender.id === +myUser.id) && friend.status === FriendStatus.ACCEPTED);
        if (friend) {
          isFriend = true;
          friendsId = friend.id;
          requestReceived = false;
          requestSent = false;
        }
      }
      return {
        ...user,
        isFriend: isFriend,
        requestSent: requestSent,
        requestReceived: requestReceived,
        friendsId: friendsId,
      }
    }
    );

    return {
      meta: {
        page: Number(page),
        pageSize: Number(size),
        pages: Math.ceil(total / Number(size)),
        total: total,
      },
      result: [...friendRequestsSent]
    }
  }

  findOne(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  async findOneByUserName(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    return user;
  }


  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
