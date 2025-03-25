import { MCPClient } from '@modelcontextprotocol/sdk/client';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio';

export interface SelectorFinderOptions {
  headless?: boolean;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  debug?: boolean;
}

export interface SelectorResult {
  selector: string;
  description: string;
  role: string;
  confidence?: number;
}

export class SelectorFinder {
  private mcpClient: MCPClient;
  private options: SelectorFinderOptions;

  constructor(options: SelectorFinderOptions = {}) {
    this.options = {
      headless: false,
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      debug: false,
      ...options
    };

    this.mcpClient = new MCPClient({
      transport: new StdioClientTransport({
        command: 'npx',
        args: [
          '@playwright/mcp',
          ...(this.options.headless ? ['--headless'] : [])
        ]
      })
    });
  }

  async init(): Promise<void> {
    await this.mcpClient.connect();
  }

  async findSelector(prompt: string): Promise<SelectorResult> {
    try {
      const response = await this.mcpClient.callTool('get_selector', { prompt });
      return JSON.parse(response.content[0].text);
    } catch (error) {
      if (this.options.debug) {
        console.error('Error finding selector:', error);
      }
      throw new Error(`Failed to find selector for prompt: ${prompt}`);
    }
  }

  async close(): Promise<void> {
    await this.mcpClient.close();
  }
}

// Export types and main class
export default SelectorFinder; 