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

  const replayKey = `${Date.now()}-${Math.round(now)}`;
  document
    .querySelectorAll<HTMLImageElement>(".hero-avatar__image")
    .forEach((image, index) => {
      const baseSrc =
        image.dataset.avatarSrc ??
        image.getAttribute("src")?.split("?")[0] ??
        "";
      if (!baseSrc) return;

      image.dataset.avatarSrc = baseSrc;
      image.src = `${baseSrc}?replay=${replayKey}-${index}`;
    });
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
