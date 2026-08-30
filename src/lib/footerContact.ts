const excludedFooterContactRoutes = [
  "/contact",
  "/tariffs",
  "/about",
];

export function hasFooterContact(pathname: string) {
  if (pathname === "/") return false;

  return !excludedFooterContactRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function shouldRenderSharedFooterContact(pathname: string) {
  return hasFooterContact(pathname);
}
