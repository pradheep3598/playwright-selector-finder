/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { test, expect } from './fixtures';

interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    [key: string]: unknown;
  };
}

interface ListResponse {
  id: number;
  jsonrpc: string;
  result: {
    tools: Tool[];
  };
}

test('test tool list', async ({ server }) => {
  const list = await server.send({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
  }) as ListResponse;

  // Verify that all required tools are present
  const toolNames = list.result.tools.map(tool => tool.name);
  expect(toolNames).toContain('browser_navigate');
  expect(toolNames).toContain('browser_go_back');
  expect(toolNames).toContain('browser_go_forward');
  expect(toolNames).toContain('browser_snapshot');
  expect(toolNames).toContain('browser_click');
  expect(toolNames).toContain('browser_hover');
  expect(toolNames).toContain('browser_type');
  expect(toolNames).toContain('browser_press_key');
  expect(toolNames).toContain('browser_wait');
  expect(toolNames).toContain('browser_save_as_pdf');
  expect(toolNames).toContain('browser_close');
  expect(toolNames).toContain('get_selector');

  // Verify that each tool has the required properties
  for (const tool of list.result.tools) {
    expect(tool).toHaveProperty('name');
    expect(tool).toHaveProperty('description');
    expect(tool).toHaveProperty('inputSchema');
    expect(tool.inputSchema).toHaveProperty('type', 'object');
  }
});

test('test resources list', async ({ server }) => {
  const list = await server.send({
    jsonrpc: '2.0',
    id: 2,
    method: 'resources/list',
  });

  expect(list).toEqual(expect.objectContaining({
    id: 2,
    result: expect.objectContaining({
      resources: [
        expect.objectContaining({
          uri: 'browser://console',
          mimeType: 'text/plain',
        }),
      ],
    }),
  }));
});

test('test browser_navigate', async ({ server }) => {
  const response = await server.send({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'browser_navigate',
      arguments: {
        url: 'data:text/html,<html><title>Title</title><body>Hello, world!</body></html>',
      },
    },
  });

  expect(response).toEqual(expect.objectContaining({
    id: 2,
    result: {
      content: [{
        type: 'text',
        text: expect.stringContaining('Page URL:'),
      }],
    },
  }));
});

test('test browser_click', async ({ server }) => {
  await server.send({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'browser_navigate',
      arguments: {
        url: 'data:text/html,<html><title>Title</title><button>Submit</button></html>',
      },
    },
  });

  const response = await server.send({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'browser_click',
      arguments: {
        element: 'Submit button',
        ref: 's1e4',
      },
    },
  });

  expect(response).toEqual(expect.objectContaining({
    id: 3,
    result: {
      content: [{
        type: 'text',
        text: expect.stringContaining('Submit button'),
      }],
    },
  }));
});
