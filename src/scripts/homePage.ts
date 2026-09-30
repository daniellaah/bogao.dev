type HomeWindow = Window & {
  __homeAvatarHoverCleanup?: () => void;
  __homeAvatarLastReplayAt?: number;
};

function storeHomeBackUrl() {
  const indexLayout = (document.querySelector("#main-content") as HTMLElement)
    ?.dataset?.layout;
  if (indexLayout) {
    sessionStorage.setItem("backUrl", "/");
  }
}

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

function replayHeroAvatarAnimation() {
  const indexLayout = (document.querySelector("#main-content") as HTMLElement)
    ?.dataset?.layout;
  if (indexLayout !== "index") return;

  const homeWindow = window as HomeWindow;
  const now = performance.now();
  if (
    homeWindow.__homeAvatarLastReplayAt &&
    now - homeWindow.__homeAvatarLastReplayAt < 300
  ) {
    return;
  }
  homeWindow.__homeAvatarLastReplayAt = now;

  document
    .querySelectorAll<HTMLImageElement>(".hero-avatar__image")
    .forEach(image => void replayAvatarImage(image));
}

function bindHeroAvatarReplay() {
  const homeWindow = window as HomeWindow;
  homeWindow.__homeAvatarHoverCleanup?.();
  homeWindow.__homeAvatarHoverCleanup = undefined;

  const indexLayout = (document.querySelector("#main-content") as HTMLElement)
    ?.dataset?.layout;
  if (indexLayout !== "index") return;

  const avatar = document.querySelector<HTMLElement>(".hero-avatar");
  if (!avatar) return;

  avatar.addEventListener("pointerenter", replayHeroAvatarAnimation);
  homeWindow.__homeAvatarHoverCleanup = () => {
    avatar.removeEventListener("pointerenter", replayHeroAvatarAnimation);
  };
}

export function setupHomePage() {
  storeHomeBackUrl();
  replayHeroAvatarAnimation();
  bindHeroAvatarReplay();
}
