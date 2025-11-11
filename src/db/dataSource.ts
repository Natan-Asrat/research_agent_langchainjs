import "reflect-metadata";
const { DataSource } = require("typeorm");
const { User } = require("../entities/User");
const { Conversation } = require("../entities/Conversation");
const { Message } = require("../entities/Message");
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true, // auto-create tables (dev only)
  logging: true,
  entities: [User, Conversation, Message],
});
