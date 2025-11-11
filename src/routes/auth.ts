import express from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../db/dataSource";
import { User } from "../entities/User";

const router = express.Router();

const accessSecret = process.env.JWT_ACCESS_SECRET!;
const refreshSecret = process.env.JWT_REFRESH_SECRET!;

export function generateTokens(user: any) {
  const payload = { id: user.id, email: user.email };

  const accessToken = jwt.sign(payload, accessSecret, { expiresIn: "15m" });


  const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: "7d" });


  return { accessToken, refreshToken };
}

// Signup
router.post("/signup", async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !password || !name)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const userRepo = AppDataSource.getRepository(User);
    const existing = await userRepo.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const user = userRepo.create({ email, name, password });
    await userRepo.save(user);

    const { password: _, ...safeUser } = user;
    const tokens = generateTokens(user);

    res.status(201).json({ message: "User created", user: safeUser, ...tokens });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Missing email or password" });

  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });

    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.password !== password)
      return res.status(401).json({ error: "Invalid password" });

    const { password: _, ...safeUser } = user;
    const tokens = generateTokens(user);

    res.json({ message: "Login successful", user: safeUser, ...tokens });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Token refresh route
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "Missing refresh token" });

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as jwt.JwtPayload;

    const accessToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      accessSecret,
      { expiresIn: "15m" }
    );

    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
});

export default router;
