import { FriendStatus } from "src/modules/friends/friends.status.enum";
import { User } from "src/modules/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'friends' })
export class Friend {


    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.friendRequestsSent, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sender_id' })
    sender: User;

    @ManyToOne(() => User, (user) => user.friendRequestsReceived, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'receiver_id' })
    receiver: User;

    @Column({ type: 'enum', enum: FriendStatus, nullable: true })
    status: FriendStatus;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @Column({ nullable: true })
    createdBy: string;

    @Column({ nullable: true })
    updatedBy: string;
}
