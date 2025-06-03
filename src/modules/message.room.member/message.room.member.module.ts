import { Module } from '@nestjs/common';
import { MessageRoomMemberService } from './message.room.member.service';
import { MessageRoomMemberController } from './message.room.member.controller';

@Module({
  controllers: [MessageRoomMemberController],
  providers: [MessageRoomMemberService],
})
export class MessageRoomMemberModule {}
