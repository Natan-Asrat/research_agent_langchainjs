# AI Research Agent with Persistent Memory in LangChain.js
This project implements a TypeScript-based backend for an AI research agent. The system combines a relational database and vector store to track user details, preferences, and research history, enabling the agent to remember previous queries and avoid redundant research.

MVP Link: [https://marketing-memories.lovable.app/](https://marketing-memories.lovable.app/)

## Backend Tech Stack
- Express
- TypeORM: orm to interface with postgres for storing user details, preferences and messages (for administrative purposes - not as memory)
- Pinecone: memory (vectorstore)
- JWT: for authentication
- GoogleGenAI: for Gemini chat model and Embeddings

## Folder Structure
- entities: typeorm db table definitions
- db: postgres + typeorm setup
- middleware: jwt secure endpoints
- routes: auth (signup/login), generate, preferences (tools to use)
- tools: mock tools
- vector: pinecone setup, embedding utilities

## Research Activity Diagram

![Research Activity Diagram](./docs/images/generate-research-agent.drawio.svg)

## UI

- New Research

    ![new research](./docs/images/ui_1.png)

- Settings & Preferences

    ![settings](./docs/images/ui_2.png)

- Memory & Tools Results

    ![memory](./docs/images/ui_3.png)

## Tests

### Signup

![signup](./docs/images/user_created.png)

### User Exists

![user exists](./docs/images/user_exists.png)

### Login

![login](./docs/images/login.png)

### Secure Endpoints

![secure endpoints](./docs/images/secure_endpoints.png)

### Save Preferences

![save preferences](./docs/images/save_preferences.png)

### Use Website Tool

- Mock Data
    
    ![website tool](./docs/images/website_tool.png)

- Result

    ![website tool result](./docs/images/website_tool_result.png)

### Embedding Generation

![embedding](./docs/images/embedding.png)

### Memory

- Pinecone setup:

    ![pinecone setup](./docs/images/pinecone_setup.png)

- Remove context from website tool

    ![remove context](./docs/images/remove_context.png)

- Result from Memory

    ![memory result](./docs/images/memory_result.png)