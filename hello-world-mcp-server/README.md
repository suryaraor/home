# Hello World MCP Server

A simple MCP (Model Context Protocol) server that demonstrates the basics of building custom tools for AI assistants.

## What is MCP?

MCP (Model Context Protocol) allows AI assistants to:
- Connect to external data sources
- Use custom tools and functions
- Access real-time information
- Perform actions on your behalf

## Features

This server provides three simple tools:
- `say_hello`: Greets a person by name
- `get_time`: Returns current date and time
- `calculate`: Performs basic math operations (add, subtract, multiply, divide)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Run the server:
```bash
npm start
```

## Development

For development with hot reload:
```bash
npm run dev
```

## How it works

1. The server defines available tools with their schemas
2. AI assistants can discover these tools using the `tools/list` request
3. When called via `tools/call`, tools execute and return results
4. Results are sent back to the AI assistant in a standardized format

## Testing

We've included several test scripts to verify your MCP server works correctly:

### Automated Tests
```bash
# Run basic automated tests
npm test

# Run comprehensive test suite with performance metrics
npm run test:comprehensive
```

### Interactive Testing
```bash
# Run interactive test client
npm run test:interactive
```

The interactive test allows you to manually test each tool and see the JSON-RPC requests/responses.

### Manual Testing

You can also test the server manually by sending JSON-RPC requests via stdin:

```bash
npm start
```

Then send requests like:
```json
{"jsonrpc":"2.0","id":1,"method":"tools/list"}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"say_hello","arguments":{"name":"World"}}}
```

## Next Steps

- Add more complex tools (file operations, API calls, database queries)
- Implement resource providers for dynamic content
- Add proper error handling and logging
- Create configuration management
