import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
dotenv.config();

const client = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,

});
const index = client.Index(process.env.PINECONE_INDEX!);
export const pineconeIndex = index;
