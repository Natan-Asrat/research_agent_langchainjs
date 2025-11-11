import generateEmbedding from "./embedding";
import { pineconeIndex } from "./pinceoneClient";
import { QueryOptions } from "@pinecone-database/pinecone";
export async function addToMemory(userId: string | number, content: string) {
  const vector: number[] = await generateEmbedding(content);

  await pineconeIndex.upsert([
    {
      id: `${userId}-${Date.now()}`,
      values: vector,
      metadata: { userId: String(userId), content },
    },
  ]);
}
export async function queryMemory(userId: string | number, query: string, topK = 5) {
  const vector = await generateEmbedding(query);

  const queryOptions: QueryOptions = {
    vector,
    topK,
    includeMetadata: true,
    filter: { userId: String(userId) },
  };

  console.log("query options", queryOptions)

  const result = await pineconeIndex.query(queryOptions);

  return result.matches?.map(m => m.metadata?.content) || [];
}