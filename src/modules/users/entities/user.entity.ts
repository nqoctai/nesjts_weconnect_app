
import { Comment } from "src/modules/comments/entities/comment.entity";
import { Friend } from "src/modules/friends/entities/friend.entity";
import { Like } from "src/modules/likes/entities/like.entity";
import { Notification } from "src/modules/notifications/entities/notification.entity";
import { Post } from "src/modules/posts/entities/post.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'users' })
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
    @Column()
    email: string;
    @Column()
    password: string;
    @Column({ nullable: true })
    phone: string;
    @Column({ nullable: true })
    address: string;
    @Column({ nullable: true })
    avatar: string;
    @Column({ nullable: true, name: 'is_active' })
    isActive: boolean;
    @Column({ nullable: true, name: 'code_id' })
    codeId: string;
    @Column({ nullable: true, name: 'code_expired' })
    codeExpired: string;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;

    @Column({ nullable: true, name: 'created_by' })
    createdBy: string;

    @Column({ nullable: true, name: 'updated_by' })
    updatedBy: string;


    @OneToMany(() => Post, (post) => post.user)
    posts: Post[];

    @OneToMany(() => Like, (like) => like.user)
    likes: Like[]

    @OneToMany(() => Comment, (comment) => comment.user)
    comments: Comment[];

    @OneToMany(() => Friend, (friend) => friend.sender)
    friendRequestsSent: Friend[];

    @OneToMany(() => Friend, (friend) => friend.receiver)
    friendRequestsReceived: Friend[];


    @OneToMany(() => Notification, (notification) => notification.user)
    notifications: Notification[];



}
