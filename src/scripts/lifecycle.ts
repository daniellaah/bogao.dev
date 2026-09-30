type Cleanup = () => void;

const registeredSetups = new Set<() => Cleanup | void>();

/**
 * Run `setup` for the current page and again after every client-side
 * navigation.
 *
 * Bundled scripts execute once per full page load, even when the ClientRouter
 * later swaps in a page that includes them again. So the script registers here
 * once: `setup` runs immediately (the document is parsed before module scripts
 * execute), then after each swap once the new body and URL are in place. A
 * cleanup returned by `setup` runs before the next swap, while the old page is
 * still in the DOM.
 *
 * Registering the same `setup` again is a no-op: two components can share a
 * setup through different entry scripts (post and project detail pages), and
 * each entry executes once when its page is first visited.
 */
export function onEveryPage(setup: () => Cleanup | void) {
  if (registeredSetups.has(setup)) return;
  registeredSetups.add(setup);

  let cleanup: Cleanup | void;

  const run = () => {
    cleanup = setup();
  };

  document.addEventListener("astro:before-swap", () => {
    cleanup?.();
    cleanup = undefined;
  });
  document.addEventListener("astro:after-swap", run);
  run();
}
