import { NextResponse, type NextRequest } from "next/server";

function hasAuthCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some(({ name }) => name.startsWith("sb-") && name.endsWith("-auth-token"));
}

export function proxy(request: NextRequest) {
  const isAuthenticated = hasAuthCookie(request);
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");

  if (isAdminPage && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
