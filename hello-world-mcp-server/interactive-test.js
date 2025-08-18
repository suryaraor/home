#!/usr/bin/env node

/**
 * Simple interactive test for the MCP server
 * This script demonstrates how to send individual requests to test each tool
 */

const { spawn } = require('child_process');
const readline = require('readline');

console.log('🚀 MCP Server Interactive Test\n');
console.log('This will start the server and allow you to test individual commands.\n');

// Start the MCP server
const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let requestId = 1;

// Handle server responses
server.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  
  lines.forEach(line => {
    try {
      const response = JSON.parse(line);
      console.log('\n📨 Server Response:');
      console.log(JSON.stringify(response, null, 2));
      console.log('\n' + '='.repeat(50));
      showMenu();
    } catch (e) {
      // Ignore non-JSON output
    }
  });
});

server.stderr.on('data', (data) => {
  console.log('🔧 Server:', data.toString().trim());
});

function showMenu() {
  console.log('\n📋 Available Tests:');
  console.log('1. List available tools');
  console.log('2. Test say_hello tool');
  console.log('3. Test get_time tool');
  console.log('4. Test calculate tool (addition)');
  console.log('5. Test calculate tool (division)');
  console.log('6. Test error handling (division by zero)');
  console.log('7. Exit');
  console.log('\nEnter your choice (1-7): ');
}

function sendRequest(request) {
  console.log('\n📤 Sending request:');
  console.log(JSON.stringify(request, null, 2));
  server.stdin.write(JSON.stringify(request) + '\n');
}

function handleChoice(choice) {
  switch (choice.trim()) {
    case '1':
      sendRequest({
        jsonrpc: '2.0',
        id: requestId++,
        method: 'tools/list'
      });
      break;
      
    case '2':
      sendRequest({
        jsonrpc: '2.0',
        id: requestId++,
        method: 'tools/call',
        params: {
          name: 'say_hello',
          arguments: {
            name: 'Interactive Tester'
          }
        }
      });
      break;
      
    case '3':
      sendRequest({
        jsonrpc: '2.0',
        id: requestId++,
        method: 'tools/call',
        params: {
          name: 'get_time',
          arguments: {}
        }
      });
      break;
      
    case '4':
      sendRequest({
        jsonrpc: '2.0',
        id: requestId++,
        method: 'tools/call',
        params: {
          name: 'calculate',
          arguments: {
            operation: 'add',
            a: 42,
            b: 58
          }
        }
      });
      break;
      
    case '5':
      sendRequest({
        jsonrpc: '2.0',
        id: requestId++,
        method: 'tools/call',
        params: {
          name: 'calculate',
          arguments: {
            operation: 'divide',
            a: 144,
            b: 12
          }
        }
      });
      break;
      
    case '6':
      sendRequest({
        jsonrpc: '2.0',
        id: requestId++,
        method: 'tools/call',
        params: {
          name: 'calculate',
          arguments: {
            operation: 'divide',
            a: 10,
            b: 0
          }
        }
      });
      break;
      
    case '7':
      console.log('\n👋 Goodbye!');
      server.kill();
      rl.close();
      process.exit(0);
      break;
      
    default:
      console.log('\n❌ Invalid choice. Please enter 1-7.');
      showMenu();
      break;
  }
}

// Wait for server to start, then show menu
setTimeout(() => {
  console.log('✅ Server started successfully!\n');
  showMenu();
}, 1000);

rl.on('line', handleChoice);

process.on('exit', () => {
  server.kill();
});
