import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { User } from 'src/decorator/customize';
import { IUser } from 'src/modules/users/user.interface';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) { }

  @Post('request')
  sendRequest(@Body() createFriendDto: CreateFriendDto, @User() user: IUser) {
    return this.friendsService.sendRequest(createFriendDto, user);
  }

  @Put('accept/:id')
  acceptRequest(@Param('id') id: string, @User() user: IUser) {
    return this.friendsService.acceptRequest(+id, user);
  }

  @Put('reject/:id')
  rejectRequest(@Param('id') id: string, @User() user: IUser) {
    return this.friendsService.rejectRequest(+id, user);
  }

  @Get('requests')
  getRequests(@User() user: IUser) {
    return this.friendsService.getReceivedFriendRequests(user);
  }

  @Get()
  getFriends(@User() user: IUser) {
    return this.friendsService.getFriends(user);
  }


}
