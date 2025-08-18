import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'hello-world-mcp-server',
    version: '1.0.0',
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'say_hello',
        description: 'Say hello to someone',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the person to greet',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'get_time',
        description: 'Get current time',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'calculate',
        description: 'Perform basic math calculations',
        inputSchema: {
          type: 'object',
          properties: {
            operation: {
              type: 'string',
              description: 'Math operation (add, subtract, multiply, divide)',
              enum: ['add', 'subtract', 'multiply', 'divide'],
            },
            a: {
              type: 'number',
              description: 'First number',
            },
            b: {
              type: 'number',
              description: 'Second number',
            },
          },
          required: ['operation', 'a', 'b'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case 'say_hello': {
      const name = request.params.arguments?.name as string;
      return {
        content: [
          {
            type: 'text',
            text: `Hello, ${name}! Welcome to the MCP world! 🌟`,
          },
        ],
      };
    }

    case 'get_time': {
      const currentTime = new Date().toLocaleString();
      return {
        content: [
          {
            type: 'text',
            text: `Current time is: ${currentTime}`,
          },
        ],
      };
    }

    case 'calculate': {
      const { operation, a, b } = request.params.arguments as {
        operation: string;
        a: number;
        b: number;
      };

      let result: number;
      switch (operation) {
        case 'add':
          result = a + b;
          break;
        case 'subtract':
          result = a - b;
          break;
        case 'multiply':
          result = a * b;
          break;
        case 'divide':
          if (b === 0) {
            throw new Error('Cannot divide by zero');
          }
          result = a / b;
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: `${a} ${operation} ${b} = ${result}`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${request.params.name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Hello World MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
