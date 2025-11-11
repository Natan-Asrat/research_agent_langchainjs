import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column("text")
  password: string;  // already encrypted password from frontend

  @Column("jsonb", { nullable: true })
  preferences: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
