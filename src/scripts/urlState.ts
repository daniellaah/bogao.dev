export const replaceCurrentUrlSearch = (params: URLSearchParams) => {
  const suffix = params.toString();

  history.replaceState(
    history.state,
    "",
    suffix ? `${window.location.pathname}?${suffix}` : window.location.pathname
  );
};
