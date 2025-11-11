import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001", // Or another suitable embedding model
  apiKey: process.env.GEMINI_API_KEY!,
});
const generateEmbedding = async (text: string): Promise<number[]> => {
    const documents = [text];

    const documentEmbeddings = await embeddings.embedDocuments(documents);
    return documentEmbeddings[0];
}

export default generateEmbedding;