# Playwright Selector Finder

A natural language-based selector finder for Playwright automation frameworks. This package helps you find elements on a web page using natural language descriptions instead of complex selectors.

## Installation

```bash
npm install playwright-selector-finder
```

## Features

- Find elements using natural language descriptions
- Support for multiple selector strategies
- Built-in retry mechanism
- Configurable options
- TypeScript support
- Integration with Playwright automation frameworks

## Usage

### Basic Usage

```typescript
import SelectorFinder from 'playwright-selector-finder';

// Initialize the finder
const finder = new SelectorFinder();
await finder.init();

// Find a selector
const result = await finder.findSelector('login button');
console.log(result);
// Output: { selector: 'aria-ref=xyz', description: 'Login', role: 'button' }

// Close when done
await finder.close();
```

### Integration with Playwright

```typescript
import { chromium } from 'playwright';
import SelectorFinder from 'playwright-selector-finder';

async function runTest() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const finder = new SelectorFinder({ headless: true });
  
  await finder.init();
  
  // Navigate to your page
  await page.goto('https://example.com');
  
  // Find and click the login button
  const loginButton = await finder.findSelector('login button');
  await page.click(loginButton.selector);
  
  await finder.close();
  await browser.close();
}

runTest();
```

### With Options

```typescript
const finder = new SelectorFinder({
  headless: true,
  timeout: 5000,
  retries: 3,
  retryDelay: 1000,
  debug: true
});
```

## API Reference

### SelectorFinder

#### Constructor Options

- `headless` (boolean): Run in headless mode (default: false)
- `timeout` (number): Operation timeout in ms (default: 30000)
- `retries` (number): Number of retries (default: 3)
- `retryDelay` (number): Delay between retries in ms (default: 1000)
- `debug` (boolean): Enable debug logging (default: false)

#### Methods

- `init()`: Initialize the finder
- `findSelector(prompt: string)`: Find a selector using natural language
- `close()`: Clean up resources

#### Return Type

The `findSelector` method returns a `SelectorResult`:

```typescript
interface SelectorResult {
  selector: string;    // The selector to use
  description: string; // Human-readable description
  role: string;       // ARIA role of the element
  confidence?: number; // Match confidence (0-1)
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.

## Playwright MCP

A Model Context Protocol (MCP) server that provides browser automation capabilities using [Playwright](https://playwright.dev). This server enables LLMs to interact with web pages through structured accessibility snapshots, bypassing the need for screenshots or visually-tuned models.

### Key Features

- **Fast and lightweight**: Uses Playwright's accessibility tree, not pixel-based input.
- **LLM-friendly**: No vision models needed, operates purely on structured data.
- **Deterministic tool application**: Avoids ambiguity common with screenshot-based approaches.

### Use Cases

- Web navigation and form-filling
- Data extraction from structured content
- Automated testing driven by LLMs
- General-purpose browser interaction for agents

### Example config

```js
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest"
      ]
    }
  }
}
```

### Running headless browser (Browser without GUI).

This mode is useful for background or batch operations.

```js
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--headless"
      ]
    }
  }
}
```

### Running headed browser on Linux w/o DISPLAY

When running headed browser on system w/o display or from worker processes of the IDEs,
you can run Playwright in a client-server manner. You'll run the Playwright server
from environment with the DISPLAY

```sh
npx playwright run-server
```

And then in MCP config, add following to the `env`:

```js
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest"
      ],
      "env": {
        // Use the endpoint from the output of the server above.
        "PLAYWRIGHT_WS_ENDPOINT": "ws://localhost:<port>/"
      }
    }
  }
}
```

### Tool Modes

The tools are available in two modes:

1. **Snapshot Mode** (default): Uses accessibility snapshots for better performance and reliability
2. **Vision Mode**: Uses screenshots for visual-based interactions

To use Vision Mode, add the `--vision` flag when starting the server:

```js
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--vision"
      ]
    }
  }
}
```

Vision Mode works best with the computer use models that are able to interact with elements using
X Y coordinate space, based on the provided screenshot.

### Snapshot Mode

The Playwright MCP provides a set of tools for browser automation. Here are all available tools:

- **browser_navigate**
  - Description: Navigate to a URL
  - Parameters:
    - `url` (string): The URL to navigate to

- **browser_go_back**
  - Description: Go back to the previous page
  - Parameters: None

- **browser_go_forward**
  - Description: Go forward to the next page
  - Parameters: None

- **browser_click**
  - Description: Perform click on a web page
  - Parameters:
    - `element` (string): Human-readable element description used to obtain permission to interact with the element
    - `ref` (string): Exact target element reference from the page snapshot

- **browser_hover**
  - Description: Hover over element on page
  - Parameters:
    - `element` (string): Human-readable element description used to obtain permission to interact with the element
    - `ref` (string): Exact target element reference from the page snapshot

- **browser_drag**
  - Description: Perform drag and drop between two elements
  - Parameters:
    - `startElement` (string): Human-readable source element description used to obtain permission to interact with the element
    - `startRef` (string): Exact source element reference from the page snapshot
    - `endElement` (string): Human-readable target element description used to obtain permission to interact with the element
    - `endRef` (string): Exact target element reference from the page snapshot

- **browser_type**
  - Description: Type text into editable element
  - Parameters:
    - `element` (string): Human-readable element description used to obtain permission to interact with the element
    - `ref` (string): Exact target element reference from the page snapshot
    - `text` (string): Text to type into the element
    - `submit` (boolean): Whether to submit entered text (press Enter after)

- **browser_press_key**
  - Description: Press a key on the keyboard
  - Parameters:
    - `key` (string): Name of the key to press or a character to generate, such as `ArrowLeft` or `a`

- **browser_snapshot**
  - Description: Capture accessibility snapshot of the current page (better than screenshot)
  - Parameters: None

- **browser_save_as_pdf**
  - Description: Save page as PDF
  - Parameters: None

- **browser_wait**
  - Description: Wait for a specified time in seconds
  - Parameters:
    - `time` (number): The time to wait in seconds (capped at 10 seconds)

- **browser_close**
  - Description: Close the page
  - Parameters: None


### Vision Mode

Vision Mode provides tools for visual-based interactions using screenshots. Here are all available tools:

- **browser_navigate**
  - Description: Navigate to a URL
  - Parameters:
    - `url` (string): The URL to navigate to

- **browser_go_back**
  - Description: Go back to the previous page
  - Parameters: None

- **browser_go_forward**
  - Description: Go forward to the next page
  - Parameters: None

- **browser_screenshot**
  - Description: Capture screenshot of the current page
  - Parameters: None

- **browser_move_mouse**
  - Description: Move mouse to specified coordinates
  - Parameters:
    - `x` (number): X coordinate
    - `y` (number): Y coordinate

- **browser_click**
  - Description: Click at specified coordinates
  - Parameters:
    - `x` (number): X coordinate to click at
    - `y` (number): Y coordinate to click at

- **browser_drag**
  - Description: Perform drag and drop operation
  - Parameters:
    - `startX` (number): Start X coordinate
    - `startY` (number): Start Y coordinate
    - `endX` (number): End X coordinate
    - `endY` (number): End Y coordinate

- **browser_type**
  - Description: Type text at specified coordinates
  - Parameters:
    - `text` (string): Text to type
    - `submit` (boolean): Whether to submit entered text (press Enter after)

- **browser_press_key**
  - Description: Press a key on the keyboard
  - Parameters:
    - `key` (string): Name of the key to press or a character to generate, such as `ArrowLeft` or `a`

- **browser_save_as_pdf**
  - Description: Save page as PDF
  - Parameters: None

- **browser_wait**
  - Description: Wait for a specified time in seconds
  - Parameters:
    - `time` (number): The time to wait in seconds (capped at 10 seconds)

- **browser_close**
  - Description: Close the page
  - Parameters: None
