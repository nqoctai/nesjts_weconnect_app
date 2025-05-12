import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AuthService } from "src/auth/auth.service";
import { Public } from "src/decorator/customize";
import { UsersService } from "src/modules/users/users.service";

@WebSocketGateway(
    {
        cors: {
            origin: 'http://localhost:5173',
            credentials: true,
        },
    }
)
@Public()
export class EventGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server: Server

    private users: { [userId: string]: { socketId: string, userId: number, email: string } } = {};

    constructor(private readonly authService: AuthService, private readonly usersService: UsersService) {

    }

    afterInit(server: Server) {
        console.log("Init")
    }

    async handleConnection(socket: Socket) {
        console.log(socket.id)
        const token = socket.handshake.auth.token;
        console.log("token", token)
        if (token) {
            try {
                const { email, id } = await this.authService.handleVerifyToken(token)
                console.log("email", email)
                console.log("id", id)
                const user = await this.usersService.findOne(id);
                console.log("user 123", user)
                socket.data.user = user;
                console.log("scoket.data.user", socket.data.user)

                if (!this.users[id]) {
                    this.users[id] = {
                        socketId: socket.id,
                        userId: id,
                        email: email,
                    }

                }
                console.log("users", this.users)
            } catch (error) {
                // socket.disconnect();
            }
        } else {
            // socket.disconnect();
        }

    }

    handleDisconnect(socket: Socket): any {
        console.log(socket.id, socket.data?.email)
        const userId = socket.data?.user.id;
        if (userId && this.users[userId]) {
            delete this.users[userId];
            console.log("user", this.users)
        }
        console.log("Disconnect")
        // Xóa socketId của người dùng khỏi danh sách



    }

    @SubscribeMessage('friendRequestSent')
    handleFriendRequest(
        @MessageBody() data: { receiverId: string },
        @ConnectedSocket() socket: Socket,
    ) {
        const receiverId = data.receiverId;
        const receiver = this.users[receiverId];
        console.log(receiver)

        if (receiver) {
            this.server.to(receiver.socketId).emit('friendRequestReceived', {
                from: socket.data.user.id, // hoặc socket.data.email
                fullName: socket.data.user.name
            });
            console.log("Đã gia nhập kênh")
        }

    }




}