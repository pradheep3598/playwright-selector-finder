import { chromium, Browser, Page } from 'playwright';

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
  private browser: Browser | null = null;
  private page: Page | null = null;
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
  }

  async init(): Promise<void> {
    this.browser = await chromium.launch({ headless: this.options.headless });
    this.page = await this.browser.newPage();
  }

  async findSelector(prompt: string): Promise<SelectorResult> {
    if (!this.page) {
      throw new Error('SelectorFinder not initialized. Call init() first.');
    }

    try {
      // Get accessibility snapshot
      const snapshot = await this.page.accessibility.snapshot();
      if (!snapshot) {
        throw new Error('No accessibility snapshot available');
      }

      // Find matching element
      const element = this.findMatchingElement(snapshot, prompt.toLowerCase());
      if (!element) {
        throw new Error(`No element found matching "${prompt}"`);
      }

      // Return selector information
      return {
        selector: `[aria-label="${element.name}"]`,
        description: element.name || '',
        role: element.role || '',
        confidence: 1.0
      };
    } catch (error) {
      if (this.options.debug) {
        console.error('Error finding selector:', error);
      }
      throw new Error(`Failed to find selector for prompt: ${prompt}`);
    }
  }

  private findMatchingElement(node: any, prompt: string): any {
    // Check current node
    if (node.name?.toLowerCase().includes(prompt) || 
        node.role?.toLowerCase().includes(prompt)) {
      return node;
    }

    // Check children
    if (node.children) {
      for (const child of node.children) {
        const match = this.findMatchingElement(child, prompt);
        if (match) return match;
      }
    }

    return null;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

// Export types and main class
export default SelectorFinder; 