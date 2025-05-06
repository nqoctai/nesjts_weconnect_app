import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { User } from 'src/decorator/customize';
import { IUser } from 'src/modules/users/user.interface';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }



  @Get()
  findAllPaginated(@Query('page') page: number, @Query('size') size: number, @User() user: IUser) {
    return this.notificationsService.findAllPaginated(page, size, user);
  }

  @Get('unread/count')
  getCountUnread(@User() user: IUser) {
    return this.notificationsService.countAllUnread(user);
  }

  @Put(":id/read")
  markAsRead(@Param('id') id: string, @User() user: IUser) {
    return this.notificationsService.markAsRead(id, user);
  }

  @Put("read-all")
  markAllAsRead() {
    return this.notificationsService.markAllAsRead();
  }


}
