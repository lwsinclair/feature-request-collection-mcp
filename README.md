[![MseeP Badge](https://mseep.net/pr/adiletd-feature-request-collection-mcp-badge.jpg)](https://mseep.ai/app/adiletd-feature-request-collection-mcp)

# Supabase MCP Server

This is a Model Context Protocol (MCP) server that connects to Supabase and allows you to query the feature_suggestions table.

## Prerequisites

- Node.js (v16 or higher)
- npm
- Supabase project with credentials

## Setup

1. Make sure your `.env` file contains the following Supabase credentials:

   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. Install the required dependencies:
   ```
   npm install
   ```

## Running the Server

Run the MCP server using:

```bash
npx tsx mcp-server.ts
```

Or use the npm script:

```bash
npm run dev
```

## Connecting to AI Tools

### Cursor

1. Open Cursor and navigate to **Cursor Settings**.
2. Under the **Features** tab, tap **+ Add new MCP server** under the **MCP Servers** section.
3. Enter the following details:
   - **Name**: Supabase
   - **Type**: command
   - **Command**: `npx tsx /path/to/mcp-server.ts`
4. You should see a green active status after the server is successfully connected.

### Claude Desktop

1. Open Claude desktop and navigate to **Settings**.
2. Under the **Developer** tab, tap **Edit Config** to open the configuration file.
3. Add the following configuration:
   ```json
   {
     "mcpServers": {
       "supabase": {
         "command": "npx",
         "args": ["tsx", "/path/to/mcp-server.ts"]
       }
     }
   }
   ```
4. Save the configuration file and restart Claude desktop.

## Available Tools

### query_feature_suggestions

Query the feature_suggestions table in your Supabase database.

Parameters:

- `limit` (number, optional): Maximum number of records to return (default: 100)

Example usage in AI tool:

```
Can you show me feature suggestions from the database?
```

Or with a limit:

```
Can you show me the top 10 feature suggestions?
```

## Troubleshooting

- If you encounter connection issues, make sure your Supabase credentials are correct.
- Check the console output for any error messages.
- Ensure that the feature_suggestions table exists in your Supabase database.
