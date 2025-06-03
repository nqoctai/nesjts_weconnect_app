import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MessageRoomMemberService } from './message.room.member.service';
import { CreateMessageRoomMemberDto } from './dto/create-message.room.member.dto';
import { UpdateMessageRoomMemberDto } from './dto/update-message.room.member.dto';

@Controller('message.room.member')
export class MessageRoomMemberController {
  constructor(private readonly messageRoomMemberService: MessageRoomMemberService) {}

  @Post()
  create(@Body() createMessageRoomMemberDto: CreateMessageRoomMemberDto) {
    return this.messageRoomMemberService.create(createMessageRoomMemberDto);
  }

  @Get()
  findAll() {
    return this.messageRoomMemberService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messageRoomMemberService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageRoomMemberDto: UpdateMessageRoomMemberDto) {
    return this.messageRoomMemberService.update(+id, updateMessageRoomMemberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messageRoomMemberService.remove(+id);
  }
}
