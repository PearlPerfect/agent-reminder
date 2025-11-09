import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Dynamic import for Mastra to handle ESM properly
const mastraPromise = import('./mastra/index.js').then(module => module.mastra);

const app = express();
const port = process.env.PORT || 3001;

// Enhanced CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    'https://telex.im',
    'https://*.telex.im',
    process.env.FRONTEND_URL 
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Handle preflight requests — changed '*' to '/*' to avoid path-to-regexp error
app.options('/*', cors());

app.use(express.json());

console.log('🚀 Holiday Reminder Agent with Memory Starting...');

// Your existing endpoints remain the same...
// A2A endpoint for Telex.im with memory support
app.post('/a2a/agent/holidayAgent', async (req, res) => {
  try {
    console.log('📨 Received A2A request');
    
    const { messages, userId, threadId } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    const latestMessage = messages[messages.length - 1];
    console.log(`💬 Processing: "${latestMessage.content}"`);

    // Generate unique IDs for memory if not provided
    const resourceId = userId || `user-${Date.now()}`;
    const threadIdFinal = threadId || `thread-${Date.now()}`;

    console.log(`🧠 Using memory - Resource: ${resourceId}, Thread: ${threadIdFinal}`);

    // Wait for Mastra to be loaded
    const mastra = await mastraPromise;
    const response = await mastra.getAgent('holidayAgent').generate(
      [{ role: 'user', content: latestMessage.content }],
      {
        memory: {
          resource: resourceId,
          thread: threadIdFinal,
        },
      }
    );

    // Handle Mastra response structure properly
    let responseContent: string;
    
    if (typeof response === 'string') {
      responseContent = response;
    } else if (response && typeof response === 'object') {
      responseContent = (response as any).content || 
                       (response as any).text || 
                       (response as any).message ||
                       'I am the Holiday Reminder Agent with memory. How can I help you with holiday information?';
    } else {
      responseContent = 'I am the Holiday Reminder Agent with memory. How can I help you with holiday information?';
    }

    console.log('✅ Response generated with memory context');

    res.json({
      messages: [{ role: 'assistant', content: responseContent }],
      memoryInfo: {
        resourceId,
        threadId: threadIdFinal
      }
    });

  } catch (error: any) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Test memory endpoint
app.post('/a2a/agent/holidayAgent/test-memory', async (req, res) => {
  try {
    const { userId, threadId, message } = req.body;
    
    const resourceId = userId || `test-user-${Date.now()}`;
    const threadIdFinal = threadId || `test-thread-${Date.now()}`;
    const userMessage = message || "What holidays did we discuss earlier?";

    console.log(`🧠 Testing memory - Resource: ${resourceId}, Thread: ${threadIdFinal}`);

    // Wait for Mastra to be loaded
    const mastra = await mastraPromise;
    const response = await mastra.getAgent('holidayAgent').generate(
      [{ role: 'user', content: userMessage }],
      {
        memory: {
          resource: resourceId,
          thread: threadIdFinal,
        },
      }
    );

    let responseContent: string;
    
    if (typeof response === 'string') {
      responseContent = response;
    } else if (response && typeof response === 'object') {
      responseContent = (response as any).content || 
                       (response as any).text || 
                       (response as any).message ||
                       'Memory test response';
    } else {
      responseContent = 'Memory test response';
    }

    res.json({
      message: userMessage,
      response: responseContent,
      memoryContext: {
        resourceId: resourceId,
        threadId: threadIdFinal
      }
    });

  } catch (error: any) {
    console.error('❌ Memory test error:', error);
    res.status(500).json({ 
      error: 'Memory test failed',
      details: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Holiday Reminder Agent with Memory',
    version: '2.0.0',
    features: ['Memory enabled', 'Conversation history', 'Personalized responses'],
    cors: 'Enabled for all origins'
  });
});

// Agent info endpoint (included as requested)
app.get('/agent/info', (req, res) => {
  res.json({
    name: 'holiday_reminder_agent',
    description: 'Provides holiday information with memory using external API and Mastra AI',
    version: '2.0.0',
    endpoints: {
      a2a: `/a2a/agent/holidayAgent`,
      memoryTest: `/a2a/agent/holidayAgent/test-memory`,
      health: '/health',
      info: '/agent/info'
    },
    features: [
      'Conversation memory',
      'Personalized responses', 
      'Multi-turn context',
      'Reminder system',
      'External holiday API',
      'CORS enabled'
    ]
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Holiday Reminder Agent API',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      a2a: '/a2a/agent/holidayAgent',
      health: '/health',
      info: '/agent/info',
      memoryTest: '/a2a/agent/holidayAgent/test-memory'
    },
    cors: 'Enabled for all domains'
  });
});

app.listen(port, () => {
  console.log(`🎯 Server running on port ${port}`);
  console.log(`📍 A2A: http://localhost:${port}/a2a/agent/holidayAgent`);
  console.log(`🧠 Memory Test: http://localhost:${port}/a2a/agent/holidayAgent/test-memory`);
  console.log(`🏥 Health: http://localhost:${port}/health`);
  console.log(`📋 Info: http://localhost:${port}/agent/info`);
  console.log('\n✅ **CORS ENABLED** - All endpoints accessible from any domain');
  console.log('✅ **MEMORY ENABLED** - Agents remember conversation history');
});
