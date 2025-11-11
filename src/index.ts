import "reflect-metadata";
const { AppDataSource } = require("./db/dataSource");
const { User } = require("./entities/User");
const { Conversation } = require("./entities/Conversation");
const { Message } = require("./entities/Message");
import router from "./routes/auth";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import generateRoute from "./routes/generate";
import preferencesRoute from "./routes/preferences";

const app = express();


app.use(cors());
app.use(bodyParser.json());
app.use("/auth", router);
app.use("/generate", generateRoute);
app.use("/preferences", preferencesRoute);


AppDataSource.initialize()
  .then(() => {
    console.log("Database connected ✅");
    app.listen(3000, () => console.log("Server running on http://localhost:3000"));
  })
  .catch((err) => console.error("Database connection error:", err));