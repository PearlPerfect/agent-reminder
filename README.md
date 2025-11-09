Holiday Reminder Agent
A Mastra-powered AI agent that provides public holiday information and automatic reminder scheduling for countries worldwide. Integrated with Telex.im for seamless chat-based interactions.

🌟 Features
🌍 Multi-Country Support: Get holiday information for 100+ countries
🔔 Smart Reminders: Automatic reminders 30, 10, 3, and 2 days before holidays
🤖 AI-Powered: Uses Mastra framework with Groq AI for intelligent responses

💬 Telex.im Integration: Ready for chat-based interactions

🚀 Fast & Reliable: External API integration for accurate holiday data

📅 Upcoming Holidays: Shows only future holidays with countdown

🛠 Tech Stack
Framework: Mastra AI
AI Provider: Groq (Llama 3.1 8B Instant)
Backend: Node.js + Express + TypeScript

External API: Nager.Date API for holiday data

Deployment: Vercel, Mastra

Integration: Telex.im A2A Protocol

📁 Project Structure
text
holiday-agent/
├── src/
│   ├── mastra/
│   │   ├── agents/
│   │   │   └── holiday-agent.ts      # AI agent definition
│   │   ├── tools/
│   │   │   └── holiday-tools.ts      # External API tools
│   │   └── index.ts                  # Mastra configuration
│   └── server.ts                     # Express server & A2A endpoint
├── package.json
├── tsconfig.json
├── vercel.json
├── .env
└── README.md
🚀 Quick Start
Prerequisites
Node.js 18+
Groq API account (free)
Telex.im access

1. Clone & Install
bash
git clone <your-repo>
cd holiday-agent
npm install
2. Environment Setup
Create .env file:

env
PORT=3001
NODE_ENV=development
GROQ_API_KEY=your_groq_api_key_here
3. Get API Keys
Groq API Key (Free):
Visit console.groq.com
Sign up with Google/GitHub
Go to API Keys section
Create new API key
Copy to your .env file

Telex Access:

bash
# In Telex.im, run:
/telex-invite your-email@example.com
4. Development
bash
# Start Mastra playground (optional)
npm run dev:mastra
# Start Express server (for Telex)
npm run dev:server

# Or start both
npm run dev
5. Deployment
bash
# Build and deploy to Vercel
npm run build
npx vercel --prod
🎯 Usage Examples
In Telex.im:
text
@Holiday Reminder Agent US holidays
@Holiday Reminder Agent What holidays are in Nigeria?
@Holiday Reminder Agent Set up reminders for UK holidays
@Holiday Reminder Agent What countries do you support?
Direct API Calls:
bash
# Health check
curl https://your-app.vercel.app/health

# A2A endpoint test
curl -X POST https://your-app.vercel.app/a2a/agent/holidayAgent \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "US holidays"
      }
    ]
  }'
🔧 API Endpoints
Endpoint	Method	Description
/a2a/agent/holidayAgent	POST	Telex A2A integration endpoint
/health	GET	Service health check
/agent/info	GET	Agent metadata and capabilities
🤖 Mastra Agent Configuration
The agent is configured with:

Model: groq/llama-3.1-8b-instant (fast & free)

Tools:
getUpcomingHolidaysTool - Fetches holiday data from external API
getAvailableCountriesTool - Lists supported countries
Instructions: Detailed prompt for holiday-focused responses

🛠 Mastra Tools
getUpcomingHolidaysTool
Input: countryCode (2-letter code)
Output: Upcoming holidays with dates and countdown
API: Nager.Date API
getAvailableCountriesTool
Input: None
Output: List of 100+ supported countries
API: Nager.Date API

📋 Supported Countries
The agent supports all countries available in the Nager.Date API including:
🇺🇸 United States (US)
🇬🇧 United Kingdom (GB)
🇳🇬 Nigeria (NG)
🇫🇷 France (FR)
🇩🇪 Germany (DE)
🇨🇦 Canada (CA)
🇦🇺 Australia (AU)
And 100+ more...

🔔 Reminder System
The agent can set up automatic reminders at multiple intervals:
📅 30 days before: Planning phase (time off, travel)
🔔 10 days before: Preparation reminder (shopping, arrangements)
⏰ 3 days before: Final countdown (confirm plans)
🎊 2 days before: Last call! (get ready)

🚀 Deployment
Vercel Deployment
Connect Repository to Vercel

Set Environment Variables in Vercel dashboard:

GROQ_API_KEY = your_groq_api_key
Auto-deploy on git push

Environment Variables
Variable	Description	Required
GROQ_API_KEY	Groq AI API key	✅ Yes
PORT	Server port	❌ Optional (default: 3001)
NODE_ENV	Environment	❌ Optional
🧪 Testing
Local Testing
bash
# Test health endpoint
curl http://localhost:3001/health

# Test A2A endpoint
curl -X POST http://localhost:3001/a2a/agent/holidayAgent \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user", 
        "content": "US holidays"
      }
    ]
  }'
Telex Integration Testing
Add workflow to Telex.im

Test with various country queries
Verify reminder system explanation
📊 Telex Workflow Configuration
json
{
  "active": true,
  "category": "productivity", 
  "description": "Get holiday information and automatic reminders",
  "name": "holiday_reminder_agent",
  "nodes": [
    {
      "id": "holiday_agent",
      "name": "holiday agent",
      "type": "a2a/mastra-a2a-node",
      "url": "https://your-app.vercel.app/a2a/agent/holidayAgent"
    }
  ],
  "settings": {
    "executionOrder": "v1"
  }
}
🐛 Troubleshooting
Common Issues
Rate Limit Errors: Groq has free tier limits - wait or upgrade
API Connection Issues: Check Nager.Date API status
Telex Integration: Verify A2A endpoint URL and format
Build Errors: Ensure all TypeScript files compile
Logs & Monitoring
Mastra Playground: http://localhost:3000/ (dev mode)
Vercel Logs: Dashboard → your project → Logs
Telex Agent Logs: https://api.telex.im/agent-logs/{channel-id}.txt

🔄 Development Workflow
Make changes to agent, tools, or server
Test locally with Mastra playground
Verify Telex integration with test messages
Deploy to Vercel for production testing
Monitor logs for any issues

📈 Future Enhancements
Persistent reminder storage
Email/SMS notifications
Holiday traditions and facts
Regional holiday variations
Calendar integration
Multi-language support

🤝 Contributing
Fork the repository
Create feature branch (git checkout -b feature/amazing-feature)
Commit changes (git commit -m 'Add amazing feature')
Push to branch (git push origin feature/amazing-feature)
Open Pull Request

📄 License
This project is licensed under the ISC License.

🙏 Acknowledgments
Mastra - AI agent framework
Groq - Fast AI inference
Nager.Date - Holiday API
Telex.im - Integration platform
