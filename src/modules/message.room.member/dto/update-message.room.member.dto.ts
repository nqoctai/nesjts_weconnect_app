import { PartialType } from '@nestjs/mapped-types';
import { CreateMessageRoomMemberDto } from './create-message.room.member.dto';

export class UpdateMessageRoomMemberDto extends PartialType(CreateMessageRoomMemberDto) {}
