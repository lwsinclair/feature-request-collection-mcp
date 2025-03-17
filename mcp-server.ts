import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

// Set up logging
const logFile = path.join(process.cwd(), 'mcp-server.log');
const logger = {
  log: (message: string) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] INFO: ${message}\n`;
    console.log(message);
    fs.appendFileSync(logFile, logMessage);
  },
  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    const errorDetails = error ? `\n${JSON.stringify(error, null, 2)}` : '';
    const logMessage = `[${timestamp}] ERROR: ${message}${errorDetails}\n`;
    console.error(message, error || '');
    fs.appendFileSync(logFile, logMessage);
  }
};

logger.log('MCP Server starting up...');
logger.log(`Current working directory: ${process.cwd()}`);
logger.log(`Log file location: ${logFile}`);

// Check if Supabase environment variables are set
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  logger.error("SUPABASE_URL and SUPABASE_ANON_KEY must be set for Supabase integration.");
  process.exit(1);
}

logger.log("Supabase environment variables found");

// Create Supabase client
let supabase;
try {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  logger.log("Supabase client created successfully");
} catch (error) {
  logger.error("Failed to create Supabase client", error);
  process.exit(1);
}

// Create an MCP server
const server = new McpServer({
  name: "SupabaseMCP",
  version: "1.0.0"
});

logger.log("MCP Server instance created");

// Add a tool to query only the feature_suggestions table
server.tool(
  "query_feature_suggestions",
  {
    limit: z.number().optional().describe("Maximum number of records to return")
  },
  async ({ limit = 100 }) => {
    const table_name = "feature_suggestions";
    try {
      logger.log(`Querying feature_suggestions table with limit: ${limit}`);
      
      const { data, error } = await supabase
        .from(table_name)
        .select('*')
        .limit(limit);
      
      if (error) {
        logger.error(`Error querying feature_suggestions table:`, error);
        return {
          content: [{ 
            type: "text", 
            text: `Error querying feature_suggestions table: ${error.message}` 
          }]
        };
      }
      
      // Log the raw data for debugging
      logger.log(`Raw data from feature_suggestions: ${JSON.stringify(data)}`);
      
      // Ensure data is properly formatted
      const formattedData = Array.isArray(data) ? data : [];
      logger.log(`Successfully retrieved ${formattedData.length} records from feature_suggestions`);
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(formattedData, null, 2) 
        }]
      };
    } catch (error) {
      logger.error(`Error in query_feature_suggestions tool for feature_suggestions table:`, error);
      return {
        content: [{ 
          type: "text", 
          text: `Error: ${error instanceof Error ? error.message : String(error)}` 
        }]
      };
    }
  }
);

logger.log("Feature suggestions query tool registered");

// Start the server
async function startServer() {
  try {
    logger.log("Starting Supabase MCP server...");
    const transport = new StdioServerTransport();
    logger.log("StdioServerTransport created");
    
    await server.connect(transport);
    logger.log("Supabase MCP server started and ready to receive commands.");
    
    // Add global error handlers
    process.on('uncaughtException', (err: Error) => {
      logger.error('Uncaught exception:', err);
    });
    
    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled rejection:', reason);
    });
  } catch (error) {
    logger.error("Failed to start MCP server:", error);
    process.exit(1);
  }
}

startServer();