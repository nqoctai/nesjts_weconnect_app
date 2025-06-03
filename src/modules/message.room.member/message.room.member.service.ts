import { Injectable } from '@nestjs/common';
import { CreateMessageRoomMemberDto } from './dto/create-message.room.member.dto';
import { UpdateMessageRoomMemberDto } from './dto/update-message.room.member.dto';

@Injectable()
export class MessageRoomMemberService {
  create(createMessageRoomMemberDto: CreateMessageRoomMemberDto) {
    return 'This action adds a new messageRoomMember';
  }

  findAll() {
    return `This action returns all messageRoomMember`;
  }

  findOne(id: number) {
    return `This action returns a #${id} messageRoomMember`;
  }

  update(id: number, updateMessageRoomMemberDto: UpdateMessageRoomMemberDto) {
    return `This action updates a #${id} messageRoomMember`;
  }

  remove(id: number) {
    return `This action removes a #${id} messageRoomMember`;
  }
}
