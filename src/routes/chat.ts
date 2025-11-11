import express, { Request, Response } from "express";
import { AppDataSource } from "../db/dataSource";
import { Conversation } from "../entities/Conversation";
import { Message } from "../entities/Message";
import { User } from "../entities/User";
import { verifyToken, TokenRequest } from "../middleware/verifyToken";

const router = express.Router();

/**
 * GET /chat/conversations/
 * Returns all conversations for the logged-in user
 */
router.get("/conversations", verifyToken, async (req: TokenRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const convoRepo = AppDataSource.getRepository(Conversation);

    const conversations = await convoRepo.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });

    res.json({ conversations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

/**
 * GET /chat/conversation/:conversationId
 * Returns all messages in a conversation for the logged-in user
 */
router.get("/conversation/:conversationId", verifyToken, async (req: TokenRequest, res: Response) => {
  const userId = req.user!.id;
  const { conversationId } = req.params;

  try {
    const convoRepo = AppDataSource.getRepository(Conversation);
    const msgRepo = AppDataSource.getRepository(Message);

    const conversation = await convoRepo.findOne({
      where: { id: parseInt(conversationId), userId },
    });

    if (!conversation) return res.status(404).json({ error: "Conversation not found" });

    const messages = await msgRepo.find({
      where: { conversationId: conversation.id },
      order: { createdAt: "ASC" }, // messages in chronological order
    });

    res.json({ conversation, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default router;
