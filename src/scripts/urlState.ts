import { storeBackUrl } from "./backNavigation";

export const getCurrentUrlSearchParams = () =>
  new URLSearchParams(window.location.search);

export const replaceCurrentUrlSearch = (params: URLSearchParams) => {
  const suffix = params.toString();

  history.replaceState(
    history.state,
    "",
    suffix ? `${window.location.pathname}?${suffix}` : window.location.pathname
  );
  // Keep the stored back link in sync with filter and query state.
  storeBackUrl();
};
