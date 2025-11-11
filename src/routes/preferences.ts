import express, { Response } from "express";
import { AppDataSource } from "../db/dataSource";
import { User } from "../entities/User";
import { verifyToken, TokenRequest } from "../middleware/verifyToken";

const router = express.Router();

router.put("/", verifyToken, async (req: TokenRequest, res: Response) => {
  const { useReddit, useYouTube, useWebsites } = req.body;
  const userId = req.user!.id;

  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Save preferences as JSON
    user.preferences = { useReddit, useYouTube, useWebsites };
    await userRepo.save(user);

    return res.json({ message: "Preferences updated", preferences: user.preferences });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update preferences" });
  }
});

export default router;
