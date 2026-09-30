import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { Window } from "happy-dom";
import { afterEach, vi } from "vitest";

type WindowOptions = { width?: number };

// Tests run in Node, where the Container API can render real components
// (happy-dom as a Vitest environment switches Vite to browser transforms, and
// Astro's SVG icon components then fail to render). Each DOM test gets a fresh
// happy-dom window exposed through the globals the client scripts use.
let currentWindow: Window | undefined;

export function createDom(url: string, { width = 1280 }: WindowOptions = {}) {
  const window = new Window({ url, width, height: 800 });
  currentWindow = window;

  const globals: Record<string, unknown> = {
    window,
    document: window.document,
    location: window.location,
    history: window.history,
    navigator: window.navigator,
    localStorage: window.localStorage,
    sessionStorage: window.sessionStorage,
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
    cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
    getComputedStyle: window.getComputedStyle.bind(window),
    Event: window.Event,
    KeyboardEvent: window.KeyboardEvent,
    HTMLElement: window.HTMLElement,
  };
  for (const [name, value] of Object.entries(globals)) {
    vi.stubGlobal(name, value);
  }

  return window;
}

afterEach(async () => {
  await currentWindow?.happyDOM.abort();
  currentWindow?.close();
  currentWindow = undefined;
});

let container: AstroContainer | undefined;

export async function renderComponent(
  component: Parameters<AstroContainer["renderToString"]>[0],
  props: Record<string, unknown> = {},
  url = "https://bogao.dev/"
) {
  container ??= await AstroContainer.create();
  return container.renderToString(component, {
    props,
    request: new Request(url),
  });
}

/** Let rAF callbacks, timers and promise chains queued by a script settle. */
export const settle = (ms = 20) =>
  new Promise(resolve => setTimeout(resolve, ms));
