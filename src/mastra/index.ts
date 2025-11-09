import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { holidayAgent } from './agents/holiday-agent.js'; 

export const mastra = new Mastra({
  agents: { holidayAgent },
  storage: new LibSQLStore({ url: ":memory:" }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'debug',
  }),
  observability: {
    default: { enabled: true },
  },
  server: {
    build: {
      openAPIDocs: true,
      swaggerUI: true,
    },
    apiRoutes: [
      {
        method: 'GET',
        path: '/health',
        handler: async () => {
          return {
            status: 'OK',
            service: 'Holiday Reminder Agent',
            version: '2.0.0',
            timestamp: new Date().toISOString()
          };
        }
      }
    ]
  }
});