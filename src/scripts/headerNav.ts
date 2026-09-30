export function setupHeaderNav() {
  const menuBtn = document.querySelector<HTMLButtonElement>("#menu-btn");
  const menuItems = document.querySelector<HTMLElement>("#menu-items");
  const menuIcon = document.querySelector<HTMLElement>("#menu-icon");
  const closeIcon = document.querySelector<HTMLElement>("#close-icon");

  if (!menuBtn || !menuItems || !menuIcon || !closeIcon) return;

  menuBtn.addEventListener("click", () => {
    const openMenu = menuBtn.getAttribute("aria-expanded") === "true";

    menuBtn.setAttribute("aria-expanded", openMenu ? "false" : "true");
    menuBtn.setAttribute("aria-label", openMenu ? "Open Menu" : "Close Menu");

    menuItems.classList.toggle("hidden");
    menuIcon.classList.toggle("hidden");
    closeIcon.classList.toggle("hidden");
  });
}
