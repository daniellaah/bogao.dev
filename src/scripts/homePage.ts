// Avatar SVG markup, fetched once per URL. A replay restarts the SVG's SMIL
// animation by pointing the <img> at a fresh blob URL of the same markup, so
// replays never re-download the file.
const avatarMarkup = new Map<string, Promise<string>>();

function loadAvatarMarkup(src: string) {
  let markup = avatarMarkup.get(src);
  if (!markup) {
    markup = fetch(src).then(response => {
      if (!response.ok) throw new Error(`${response.status} ${src}`);
      return response.text();
    });
    markup.catch(() => avatarMarkup.delete(src));
    avatarMarkup.set(src, markup);
  }
  return markup;
}

async function replayAvatarImage(image: HTMLImageElement) {
  const baseSrc =
    image.dataset.avatarSrc ?? image.getAttribute("src")?.split("?")[0] ?? "";
  if (!baseSrc || baseSrc.startsWith("blob:")) return;
  image.dataset.avatarSrc = baseSrc;

  try {
    const markup = await loadAvatarMarkup(baseSrc);
    const previousUrl = image.dataset.avatarBlob;
    const url = URL.createObjectURL(
      new Blob([markup], { type: "image/svg+xml" })
    );
    image.dataset.avatarBlob = url;
    image.src = url;
    if (previousUrl) URL.revokeObjectURL(previousUrl);
  } catch {
    // Keep showing the current image; the replay is decorative.
  }
}

const REPLAY_THROTTLE_MS = 300;
let lastReplayAt = 0;

function replayHeroAvatarAnimation() {
  const now = performance.now();
  if (lastReplayAt && now - lastReplayAt < REPLAY_THROTTLE_MS) return;
  lastReplayAt = now;

  document
    .querySelectorAll<HTMLImageElement>(".hero-avatar__image")
    .forEach(image => void replayAvatarImage(image));
}

export function setupHomePage() {
  const avatar = document.querySelector<HTMLElement>(
    "#main-content[data-layout='index'] .hero-avatar"
  );
  if (!avatar) return;

  replayHeroAvatarAnimation();
  avatar.addEventListener("pointerenter", replayHeroAvatarAnimation);
}
