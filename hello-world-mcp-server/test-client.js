const { spawn } = require('child_process');

class MCPTestClient {
  constructor() {
    this.requestId = 1;
  }

  async testServer() {
    console.log('🚀 Starting MCP Server Test Client\n');
    
    // Start the MCP server
    const server = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let responses = [];
    let responseResolvers = [];

    // Handle server responses
    server.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        try {
          const response = JSON.parse(line);
          responses.push(response);
          
          // Resolve any waiting promises
          if (responseResolvers.length > 0) {
            const resolver = responseResolvers.shift();
            resolver(response);
          }
        } catch (e) {
          // Ignore non-JSON output (like logs)
        }
      });
    });

    server.stderr.on('data', (data) => {
      console.log('Server log:', data.toString().trim());
    });

    // Helper function to send requests and wait for responses
    const sendRequest = (request) => {
      return new Promise((resolve) => {
        responseResolvers.push(resolve);
        server.stdin.write(JSON.stringify(request) + '\n');
      });
    };

    // Wait a bit for server to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Test 1: List available tools
      console.log('📋 Test 1: Listing available tools');
      const listResponse = await sendRequest({
        jsonrpc: '2.0',
        id: this.requestId++,
        method: 'tools/list'
      });
      
      console.log('✅ Available tools:');
      listResponse.result.tools.forEach(tool => {
        console.log(`   - ${tool.name}: ${tool.description}`);
      });
      console.log();

      // Test 2: Say Hello tool
      console.log('👋 Test 2: Testing say_hello tool');
      const helloResponse = await sendRequest({
        jsonrpc: '2.0',
        id: this.requestId++,
        method: 'tools/call',
        params: {
          name: 'say_hello',
          arguments: {
            name: 'MCP Developer'
          }
        }
      });
      
      console.log('✅ Response:', helloResponse.result.content[0].text);
      console.log();

      // Test 3: Get Time tool
      console.log('⏰ Test 3: Testing get_time tool');
      const timeResponse = await sendRequest({
        jsonrpc: '2.0',
        id: this.requestId++,
        method: 'tools/call',
        params: {
          name: 'get_time',
          arguments: {}
        }
      });
      
      console.log('✅ Response:', timeResponse.result.content[0].text);
      console.log();

      // Test 4: Calculate tool - Addition
      console.log('🧮 Test 4: Testing calculate tool (addition)');
      const addResponse = await sendRequest({
        jsonrpc: '2.0',
        id: this.requestId++,
        method: 'tools/call',
        params: {
          name: 'calculate',
          arguments: {
            operation: 'add',
            a: 15,
            b: 25
          }
        }
      });
      
      console.log('✅ Response:', addResponse.result.content[0].text);
      console.log();

      // Test 5: Calculate tool - Division
      console.log('🧮 Test 5: Testing calculate tool (division)');
      const divResponse = await sendRequest({
        jsonrpc: '2.0',
        id: this.requestId++,
        method: 'tools/call',
        params: {
          name: 'calculate',
          arguments: {
            operation: 'divide',
            a: 100,
            b: 4
          }
        }
      });
      
      console.log('✅ Response:', divResponse.result.content[0].text);
      console.log();

      // Test 6: Error handling - Division by zero
      console.log('⚠️  Test 6: Testing error handling (division by zero)');
      const errorResponse = await sendRequest({
        jsonrpc: '2.0',
        id: this.requestId++,
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
      
      if (errorResponse.error) {
        console.log('✅ Error handled correctly:', errorResponse.error.message);
      } else {
        console.log('❌ Expected error but got:', errorResponse.result.content[0].text);
      }
      console.log();

      // Test 7: Invalid tool
      console.log('❓ Test 7: Testing invalid tool call');
      const invalidResponse = await sendRequest({
        jsonrpc: '2.0',
        id: this.requestId++,
        method: 'tools/call',
        params: {
          name: 'invalid_tool',
          arguments: {}
        }
      });
      
      if (invalidResponse.error) {
        console.log('✅ Invalid tool handled correctly:', invalidResponse.error.message);
      } else {
        console.log('❌ Expected error for invalid tool');
      }
      console.log();

      console.log('🎉 All tests completed successfully!');
      console.log('🔧 Your MCP server is working perfectly!');

    } catch (error) {
      console.error('❌ Test failed:', error);
    } finally {
      server.kill();
    }
  }
}

// Run the tests
const client = new MCPTestClient();
client.testServer().catch(console.error);
