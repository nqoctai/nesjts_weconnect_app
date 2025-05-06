import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { hashPassword } from 'src/utils/brypt';


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

  async findAll(page: string, size: string, filter: string = "") {

    const skip = (Number(page) - 1) * Number(size);

    const [res, total] = await this.usersRepository.findAndCount(
      {
        where: {
          name: Like(`%${filter}%`),
        },
        take: Number(size) || 10,
        skip: skip || 0,
        relations: {
          friendRequestsSent: true,
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

    return {
      meta: {
        page: Number(page),
        pageSize: Number(size),
        pages: Math.ceil(total / Number(size)),
        total: total,
      },
      result: [...res]
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
