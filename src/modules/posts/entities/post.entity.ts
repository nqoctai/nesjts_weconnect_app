import { User } from "src/modules/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'posts' })
export class Post {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @Column()
    image: string;


    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @Column({ nullable: true })
    createdBy: string;

    @Column({ nullable: true })
    updatedBy: string;

    @ManyToOne(() => User, (user) => user.posts)
    @JoinColumn({ name: 'userId' })
    user: User;


    // likes;


    // comments;
}
