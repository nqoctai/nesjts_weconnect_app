import { IsNotEmpty, IsString } from "class-validator";

export class CreateFriendDto {

    @IsNotEmpty()
    receiverId: string;
}
