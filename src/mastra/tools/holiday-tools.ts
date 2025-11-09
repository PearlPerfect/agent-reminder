// src/mastra/tools/holiday-tools.ts
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import axios from "axios";

export const getUpcomingHolidaysTool = createTool({
  id: "get-upcoming-holidays",
  description: "Fetches upcoming public holidays for a specific country from current date with reminder calculations",
  inputSchema: z.object({
    countryCode: z.string().min(2).max(2).describe("2-letter country code (e.g., US, GB, FR, NG, CM)"),
  }),
  outputSchema: z.object({
    holidays: z.array(z.object({
      date: z.string(),
      name: z.string(),
      localName: z.string(),
      daysUntil: z.number(),
      reminders: z.array(z.object({
        daysBefore: z.number(),
        reminderDate: z.string(),
        message: z.string()
      }))
    })),
    country: z.string(),
    year: z.number(),
    reminderSchedule: z.array(z.number())
  }),
  execute: async ({ context }) => {
    const { countryCode } = context;
    const currentYear = new Date().getFullYear();
    const reminderDays = [30, 10, 3, 2]; 
    
    console.log(`🎯 Fetching holidays for ${countryCode} in ${currentYear}`);
    
    try {
      const response = await axios.get(
        `https://date.nager.at/api/v3/PublicHolidays/${currentYear}/${countryCode.toUpperCase()}`,
        {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'HolidayReminderAgent/1.0'
          }
        }
      );

      if (!Array.isArray(response.data)) {
        throw new Error(`Invalid response format from API. Expected array, got: ${typeof response.data}`);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingHolidays = response.data
        .filter((holiday: any) => {
          try {
            const holidayDate = new Date(holiday.date);
            holidayDate.setHours(0, 0, 0, 0);
            return holidayDate >= today;
          } catch (error) {
            console.warn(`⚠️ Invalid holiday date: ${holiday.date}`, error);
            return false;
          }
        })
        .map((holiday: any) => {
          const holidayDate = new Date(holiday.date);
          holidayDate.setHours(0, 0, 0, 0);
          const daysUntil = Math.ceil((holidayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          const reminders = reminderDays
            .filter(daysBefore => daysUntil > daysBefore) 
            .map(daysBefore => {
              const reminderDate = new Date(holidayDate);
              reminderDate.setDate(holidayDate.getDate() - daysBefore);
              
              let message = '';
              switch (daysBefore) {
                case 30:
                  message = `📅 30-day planning reminder for ${holiday.name}`;
                  break;
                case 10:
                  message = `🔔 10-day preparation reminder for ${holiday.name}`;
                  break;
                case 3:
                  message = `⏰ 3-day countdown for ${holiday.name}`;
                  break;
                case 2:
                  message = `🎊 2-day final reminder for ${holiday.name}`;
                  break;
                default:
                  message = `📌 ${daysBefore}-day reminder for ${holiday.name}`;
              }
              
              return {
                daysBefore,
                reminderDate: reminderDate.toISOString().split('T')[0],
                message
              };
            });

          return {
            date: holiday.date,
            name: holiday.name,
            localName: holiday.localName,
            daysUntil,
            reminders
          };
        });

      console.log(`✅ Found ${upcomingHolidays.length} upcoming holidays for ${countryCode}`);

      return {
        holidays: upcomingHolidays,
        country: countryCode,
        year: currentYear,
        reminderSchedule: reminderDays
      };

    } catch (error: any) {
      console.error('❌ Holiday fetch error:', error.message);
      
      if (error.response?.status === 404) {
        throw new Error(`No holiday data found for country code '${countryCode}'. Please check if the country code is correct.`);
      } else if (error.response?.status === 429) {
        throw new Error('Holiday API rate limit exceeded. Please try again in a few minutes.');
      } else if (error.code === 'ENOTFOUND') {
        throw new Error('Unable to connect to holiday service. Please check your internet connection.');
      } else {
        throw new Error(`Failed to fetch holidays: ${error.message}`);
      }
    }
  },
});

export const getAvailableCountriesTool = createTool({
  id: "get-available-countries",
  description: "Gets list of all available countries for holiday data",
  inputSchema: z.object({}),
  outputSchema: z.object({
    countries: z.array(z.object({
      countryCode: z.string(),
      name: z.string(),
    })),
  }),
  execute: async () => {
    try {
      console.log('🌍 Fetching available countries...');
      
      const response = await axios.get(
        'https://date.nager.at/api/v3/AvailableCountries',
        {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'HolidayReminderAgent/1.0'
          }
        }
      );

      if (!Array.isArray(response.data)) {
        throw new Error(`Invalid countries response format: ${typeof response.data}`);
      }
      
      console.log(`✅ Found ${response.data.length} available countries`);
      
      return { countries: response.data };
    } catch (error: any) {
      console.error('❌ Countries fetch error:', error.message);
      throw new Error(`Failed to fetch available countries: ${error.message}`);
    }
  },
});

export const setupReminderSystemTool = createTool({
  id: "setup-reminder-system",
  description: "Sets up automatic holiday reminders for a specific country",
  inputSchema: z.object({
    countryCode: z.string().min(2).max(2).describe("2-letter country code for reminders"),
    reminderDays: z.array(z.number()).optional().describe("Days before holiday to send reminders (default: [30, 10, 3, 2])")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    country: z.string(),
    totalHolidays: z.number(),
    totalReminders: z.number(),
    reminderSchedule: z.array(z.number())
  }),
  execute: async ({ context }) => {
    try {
      const { countryCode, reminderDays = [30, 10, 3, 2] } = context;
      
      console.log(`🔔 Setting up reminders for ${countryCode}`);
      
      const response = await axios.get(
        `https://date.nager.at/api/v3/PublicHolidays/${new Date().getFullYear()}/${countryCode.toUpperCase()}`,
        {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'HolidayReminderAgent/1.0'
          }
        }
      );

      if (!Array.isArray(response.data)) {
        throw new Error(`Invalid holidays response format: ${typeof response.data}`);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingHolidays = response.data.filter((holiday: any) => {
        try {
          const holidayDate = new Date(holiday.date);
          holidayDate.setHours(0, 0, 0, 0);
          return holidayDate >= today;
        } catch (error) {
          console.warn(`⚠️ Invalid holiday date: ${holiday.date}`, error);
          return false;
        }
      });

      const totalReminders = upcomingHolidays.length * reminderDays.length;

      console.log(`✅ Reminder system setup for ${countryCode}: ${upcomingHolidays.length} holidays, ${totalReminders} total reminders`);

      return {
        success: true,
        message: `✅ Reminder system activated for ${countryCode}! You'll receive ${reminderDays.length} reminders for each of the ${upcomingHolidays.length} upcoming holidays.`,
        country: countryCode,
        totalHolidays: upcomingHolidays.length,
        totalReminders: totalReminders,
        reminderSchedule: reminderDays
      };
    } catch (error: any) {
      console.error('❌ Reminder setup error:', error.message);
      throw new Error(`Failed to setup reminder system: ${error.message}`);
    }
  },
});