import express, { Request, Response } from "express";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Conversation } from "../entities/Conversation";
import { Message } from "../entities/Message";
import { User } from "../entities/User";
import { AppDataSource } from "../db/dataSource";
import { verifyToken, TokenRequest } from "../middleware/verifyToken";
import dotenv from "dotenv";
import {addToMemory, queryMemory} from "../vector/memory";
import { RedditTool, YouTubeTool, WebsiteTool, ReportTool } from "../tools/mock_tools";
import { HumanMessage } from "langchain";
import generateEmbedding from "../vector/embedding";
dotenv.config();
const router = express.Router();

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.7,
  maxOutputTokens: 2048,
});

router.post("/", verifyToken, async (req: TokenRequest, res: Response) => {
  const { prompt, conversationId } = req.body;
  const userId = req.user!.id;

  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    const convoRepo = AppDataSource.getRepository(Conversation);
    const msgRepo = AppDataSource.getRepository(Message);
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const memoryResults = await queryMemory(userId, prompt);

    const redditTool = new RedditTool();
    const youtubeTool = new YouTubeTool();
    const websiteTool = new WebsiteTool();
    const reportTool = new ReportTool();

    // Filter tools according to preferences
    const tools = [];
    if (user.preferences?.useReddit) tools.push(redditTool);
    if (user.preferences?.useYouTube) tools.push(youtubeTool);
    if (user.preferences?.useWebsites) tools.push(websiteTool);
    tools.push(reportTool); // Always include report

    // Bind tools to model
    const modelWithTools = model.bindTools(tools);

    // Check if existing conversation
    let conversation = null;
    if (conversationId) {
      conversation = await convoRepo.findOne({ where: { id: conversationId, userId } });
      if (!conversation) return res.status(404).json({ error: "Conversation not found" });
    }

    // Save user's message
    const userMsg = msgRepo.create({
      conversationId: conversation?.id || 0,
      userId,
      role: "user",
      content: prompt,
    });

    // 1. Initial model call -> get tool calls
    const initialResponse = await modelWithTools.invoke(
      `User query: "${prompt}". You may call tools if needed. Return function calls for tools.
      If the question is about the current valuation of a company, use the website tool.
      If the question is about current events, use the youtube tool.
      If the question is about what people think about a company, use the reddit tool.
      If the question is about a report, use the report tool.

      Previous research (memory): ${memoryResults.join("\n\n") || "None"}
      `
    );

    // 2. Execute tool calls
    const toolCalls = initialResponse.tool_calls || [];
    const toolResults: Record<string, string> = {};

    for (const call of toolCalls) {
      const tool = tools.find(t => t.name === call.name);
      if (tool) {
        const result = await tool._call(call.args);
        console.log(`Executed tool "${tool.name}" with args ${JSON.stringify(call.args)} -> ${result}`);
        toolResults[call.name] = result;
      }
    }

    // 3. Feed tool results back for final assistant response
    let assistantResponse = initialResponse;
    if (toolCalls.length > 0) {
      assistantResponse = await modelWithTools.invoke(
        `User query: "${prompt}". Tool results: ${JSON.stringify(toolResults)}. Generate final assistant response.`
      );
    }

    // === New conversation -> generate title separately ===
    if (!conversation) {
        //@ts-ignore
      const titleResponse = await model.invoke(
        [new HumanMessage(`Generate a short descriptive title for the following user query:\n"${prompt}"`)],

      );
      console.log("title", titleResponse)
      const title = titleResponse.content.trim() || "Untitled Conversation";

      conversation = convoRepo.create({
        userId,
        title,
      });
      await convoRepo.save(conversation);
      userMsg.conversationId = conversation.id;
    }

    await msgRepo.save(userMsg);

    // Save AI message
    const aiMsg = msgRepo.create({
      conversationId: conversation.id,
      userId,
      role: "assistant",
      content: assistantResponse,
    });
    await msgRepo.save(aiMsg);
    await addToMemory(userId, assistantResponse.content);


    return res.json({
      conversationId: conversation.id,
      conversationTitle: conversation.title,
      response: assistantResponse.content,
      toolResults,
      memoryResults
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to generate response" });
  }
});

export default router;
