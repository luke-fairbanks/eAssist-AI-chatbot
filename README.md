# AI-Powered IT Support Chatbot

This is an AI-powered IT support chatbot that allows users to describe their IT issues in natural language. The app returns 2-5 likely IT problems from a MongoDB collection called `flowOption` and walks users through a branching conversation flow.

## Project Structure

The project consists of two main parts:

- **Backend**: Node.js + TypeScript + Express + MongoDB
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui

## Features

- Natural language processing of IT issues
- Vector embeddings using Google Gemini API
- Semantic similarity search to find relevant IT issues
- Branching conversation flows based on user selections
- Responsive chat interface
- Back and restart navigation commands
- Conversation history tracking (logs)
- Docker deployment configuration

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- MongoDB instance
- Google Gemini API key

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   MONGODB_URI=[I'll send it to you]
   GEMINI_API_KEY=[I'll send it to you]
   PORT=5000
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Seed the database with sample data:
   ```
   npm run seed
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Docker Deployment

The project includes Docker configuration for easy deployment:

1. Create a `.env` file in the root directory with your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   ```

2. Build and start the containers:
   ```
   docker-compose up -d
   ```

3. Seed the database with sample data:
   ```
   docker-compose exec backend npm run seed
   ```

4. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:5000

5. Stop the containers:
   ```
   docker-compose down
   ```

## MongoDB Schema

The `flowOption` collection should have the following schema:

```typescript
{
  _id: string;
  message: string;
  parentId?: string;
  isMenu?: boolean;
  hasUserInput?: boolean;
  closesTicket?: boolean;
  type?: string;
  severity?: number;
}
```

## API Endpoints

### Flow Endpoints
- `POST /api/find-matches`: Accepts a user message and returns similar flowOptions
- `GET /api/continue-flow?optionId=...`: Returns child nodes for the selected option

### Chat Log Endpoints
- `POST /api/logs/sessions`: Start a new chat session
- `POST /api/logs/sessions/message`: Add a message to an existing chat session
- `PUT /api/logs/sessions/:sessionId/end`: End a chat session
- `GET /api/logs/logs`: Get all chat logs (with optional userId filter)
- `GET /api/logs/sessions/:sessionId`: Get a specific chat session

## Using the Chatbot

1. Type your IT issue in the chat input
2. Select from the suggested options
3. Follow the conversation flow to resolve your issue
4. Use the "Back" button to return to previous steps
5. Use the "Restart" button or type "/restart" to start over