import { Comment } from "src/modules/comments/entities/comment.entity";
import { Friend } from "src/modules/friends/entities/friend.entity";
import { Like } from "src/modules/likes/entities/like.entity";
import { NotificationType } from "src/modules/notifications/notification.type.enum";
import { Post } from "src/modules/posts/entities/post.entity";
import { User } from "src/modules/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'notifications' })
export class Notification {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;


    @Column({ type: 'enum', enum: NotificationType, nullable: true })
    type: NotificationType;

    @ManyToOne(() => Post, (post) => post.notifications, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'post_id' })
    post: Post; // nullable


    @OneToOne(() => Like, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'like_id' })
    like: Like; // nullable

    @OneToOne(() => Comment, { nullable: true })
    @JoinColumn({ name: 'comment_id' })
    comment: Comment; // nullabl

    @ManyToOne(() => Friend, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'friend_id' })
    friend: Friend; // nullable

    @Column({ nullable: true, default: false, name: 'is_read' })
    isRead: boolean;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;

    @Column({ nullable: true, name: 'created_by' })
    createdBy: string;

    @Column({ nullable: true, name: 'updated_by' })
    updatedBy: string;
}
