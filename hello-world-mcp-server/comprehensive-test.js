/**
 * Comprehensive test examples for the Hello World MCP Server
 * 
 * This file demonstrates various ways to test and interact with your MCP server:
 * 1. Basic tool discovery
 * 2. Tool execution with different parameters
 * 3. Error handling scenarios
 * 4. Performance testing
 */

const { spawn } = require('child_process');
const { performance } = require('perf_hooks');

class MCPServerTester {
  constructor() {
    this.server = null;
    this.requestId = 1;
    this.testResults = [];
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      this.server = spawn('node', ['dist/index.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.server.stderr.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Hello World MCP server running on stdio')) {
          console.log('✅ Server started successfully');
          resolve();
        }
      });

      this.server.on('error', reject);
      
      // Timeout after 5 seconds
      setTimeout(() => reject(new Error('Server start timeout')), 5000);
    });
  }

  async sendRequest(request) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 5000);

      const onData = (data) => {
        const lines = data.toString().split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const response = JSON.parse(line);
            if (response.id === request.id) {
              clearTimeout(timeout);
              this.server.stdout.removeListener('data', onData);
              
              const endTime = performance.now();
              response._responseTime = endTime - startTime;
              
              resolve(response);
              return;
            }
          } catch (e) {
            // Ignore non-JSON lines
          }
        }
      };

      this.server.stdout.on('data', onData);
      this.server.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  async runTest(testName, testFn) {
    console.log(`\n🧪 Running: ${testName}`);
    const startTime = performance.now();
    
    try {
      const result = await testFn();
      const endTime = performance.now();
      
      this.testResults.push({
        name: testName,
        status: 'PASS',
        duration: endTime - startTime,
        result
      });
      
      console.log(`✅ ${testName} - PASSED (${(endTime - startTime).toFixed(2)}ms)`);
      return result;
    } catch (error) {
      const endTime = performance.now();
      
      this.testResults.push({
        name: testName,
        status: 'FAIL',
        duration: endTime - startTime,
        error: error.message
      });
      
      console.log(`❌ ${testName} - FAILED: ${error.message}`);
      throw error;
    }
  }

  async testToolDiscovery() {
    const response = await this.sendRequest({
      jsonrpc: '2.0',
      id: this.requestId++,
      method: 'tools/list'
    });

    if (!response.result || !response.result.tools) {
      throw new Error('No tools returned');
    }

    const expectedTools = ['say_hello', 'get_time', 'calculate'];
    const actualTools = response.result.tools.map(t => t.name);
    
    for (const tool of expectedTools) {
      if (!actualTools.includes(tool)) {
        throw new Error(`Missing expected tool: ${tool}`);
      }
    }

    return {
      toolCount: response.result.tools.length,
      tools: actualTools,
      responseTime: response._responseTime
    };
  }

  async testSayHello() {
    const testCases = [
      { name: 'World', expected: 'Hello, World!' },
      { name: 'MCP Developer', expected: 'Hello, MCP Developer!' },
      { name: '🚀', expected: 'Hello, 🚀!' }
    ];

    const results = [];
    
    for (const testCase of testCases) {
      const response = await this.sendRequest({
        jsonrpc: '2.0',
        id: this.requestId++,
        method: 'tools/call',
        params: {
          name: 'say_hello',
          arguments: { name: testCase.name }
        }
      });

      if (response.error) {
        throw new Error(`Say hello failed: ${response.error.message}`);
      }

      const text = response.result.content[0].text;
      if (!text.includes(testCase.expected.split('!')[0])) {
        throw new Error(`Expected greeting for "${testCase.name}", got: ${text}`);
      }

      results.push({
        input: testCase.name,
        output: text,
        responseTime: response._responseTime
      });
    }

    return results;
  }

  async testCalculator() {
    const testCases = [
      { operation: 'add', a: 10, b: 5, expected: 15 },
      { operation: 'subtract', a: 10, b: 3, expected: 7 },
      { operation: 'multiply', a: 6, b: 7, expected: 42 },
      { operation: 'divide', a: 20, b: 4, expected: 5 },
      { operation: 'divide', a: 10, b: 3, expected: 3.3333333333333335 }
    ];

    const results = [];

    for (const testCase of testCases) {
      const response = await this.sendRequest({
        jsonrpc: '2.0',
        id: this.requestId++,
        method: 'tools/call',
        params: {
          name: 'calculate',
          arguments: testCase
        }
      });

      if (response.error) {
        throw new Error(`Calculate failed: ${response.error.message}`);
      }

      const text = response.result.content[0].text;
      const actualResult = parseFloat(text.split(' = ')[1]);
      
      if (Math.abs(actualResult - testCase.expected) > 0.0001) {
        throw new Error(`Expected ${testCase.expected}, got ${actualResult}`);
      }

      results.push({
        operation: `${testCase.a} ${testCase.operation} ${testCase.b}`,
        expected: testCase.expected,
        actual: actualResult,
        responseTime: response._responseTime
      });
    }

    return results;
  }

  async testErrorHandling() {
    const errorTests = [
      {
        name: 'Division by zero',
        request: {
          jsonrpc: '2.0',
          id: this.requestId++,
          method: 'tools/call',
          params: {
            name: 'calculate',
            arguments: { operation: 'divide', a: 10, b: 0 }
          }
        },
        expectedError: 'Cannot divide by zero'
      },
      {
        name: 'Invalid tool',
        request: {
          jsonrpc: '2.0',
          id: this.requestId++,
          method: 'tools/call',
          params: {
            name: 'nonexistent_tool',
            arguments: {}
          }
        },
        expectedError: 'Unknown tool'
      },
      {
        name: 'Invalid operation',
        request: {
          jsonrpc: '2.0',
          id: this.requestId++,
          method: 'tools/call',
          params: {
            name: 'calculate',
            arguments: { operation: 'power', a: 2, b: 3 }
          }
        },
        expectedError: 'Unknown operation'
      }
    ];

    const results = [];

    for (const test of errorTests) {
      const response = await this.sendRequest(test.request);
      
      if (!response.error) {
        throw new Error(`Expected error for ${test.name}, but got success`);
      }

      if (!response.error.message.includes(test.expectedError)) {
        throw new Error(`Expected error containing "${test.expectedError}", got: ${response.error.message}`);
      }

      results.push({
        test: test.name,
        error: response.error.message,
        responseTime: response._responseTime
      });
    }

    return results;
  }

  async testPerformance() {
    const iterations = 10;
    const results = [];

    for (let i = 0; i < iterations; i++) {
      const response = await this.sendRequest({
        jsonrpc: '2.0',
        id: this.requestId++,
        method: 'tools/call',
        params: {
          name: 'calculate',
          arguments: { operation: 'add', a: i, b: i * 2 }
        }
      });

      if (response.error) {
        throw new Error(`Performance test failed: ${response.error.message}`);
      }

      results.push(response._responseTime);
    }

    const avgResponseTime = results.reduce((a, b) => a + b, 0) / results.length;
    const maxResponseTime = Math.max(...results);
    const minResponseTime = Math.min(...results);

    return {
      iterations,
      avgResponseTime: parseFloat(avgResponseTime.toFixed(2)),
      maxResponseTime: parseFloat(maxResponseTime.toFixed(2)),
      minResponseTime: parseFloat(minResponseTime.toFixed(2)),
      allTimes: results
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive MCP Server Test Suite\n');

    try {
      await this.startServer();

      await this.runTest('Tool Discovery', () => this.testToolDiscovery());
      await this.runTest('Say Hello Tool', () => this.testSayHello());
      await this.runTest('Calculator Tool', () => this.testCalculator());
      await this.runTest('Error Handling', () => this.testErrorHandling());
      await this.runTest('Performance Test', () => this.testPerformance());

      this.generateReport();

    } catch (error) {
      console.error('\n💥 Test suite failed:', error.message);
    } finally {
      if (this.server) {
        this.server.kill();
      }
    }
  }

  generateReport() {
    console.log('\n📊 Test Report');
    console.log('='.repeat(50));

    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const totalTime = this.testResults.reduce((sum, r) => sum + r.duration, 0);

    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total Time: ${totalTime.toFixed(2)}ms`);
    console.log(`Success Rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);

    if (failed === 0) {
      console.log('\n🎉 All tests passed! Your MCP server is working perfectly!');
    } else {
      console.log('\n⚠️  Some tests failed. Check the output above for details.');
    }
  }
}

// Run the comprehensive test suite
const tester = new MCPServerTester();
tester.runAllTests().catch(console.error);
