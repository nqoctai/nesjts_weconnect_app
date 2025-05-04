
import { Comment } from "src/modules/comments/entities/comment.entity";
import { Friend } from "src/modules/friends/entities/friend.entity";
import { Like } from "src/modules/likes/entities/like.entity";
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
    @Column({ nullable: true })
    isActive: boolean;
    @Column({ nullable: true })
    codeId: string;
    @Column({ nullable: true })
    codeExpired: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    createdBy: string;

    @Column({ nullable: true })
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



}
