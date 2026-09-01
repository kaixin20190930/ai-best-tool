import { JSDOM, VirtualConsole } from 'jsdom';

const quietVirtualConsole = new VirtualConsole();

export default function createIntelligenceDom(html: string, url: string): JSDOM {
  // Third-party CSS parse errors are not evidence extraction failures.
  return new JSDOM(html, { url, virtualConsole: quietVirtualConsole });
}
