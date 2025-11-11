import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm";
import { User } from "./User";
import { Conversation } from "./Conversation";

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  conversationId: number;

  @ManyToOne(() => Conversation, { onDelete: "CASCADE" })
  @JoinColumn({ name: "conversationId" })
  conversation: Conversation;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "text" })
  role: "user" | "assistant";

  @Column({ type: "text" })
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
