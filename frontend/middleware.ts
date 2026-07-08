import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const activeBranch = request.cookies.get("active_branch_id")?.value;
  const role = request.cookies.get("role")?.value || "SUPER_ADMIN";

  const path = request.nextUrl.pathname;
  const isAuthPage = path === "/login";

  const isProtected =
    path.startsWith("/super-admin") ||
    path.startsWith("/company") ||
    path.startsWith("/branch") ||
    path.startsWith("/employee");

  if (path.startsWith("/branch") && !activeBranch) {
    return NextResponse.redirect(new URL("/company/dashboard", request.url));
  }

  let url = "";
  switch (role) {
    case "SUPER_ADMIN":
      url = "/super-admin/dashboard";
      break;
    case "COMPANY_ADMIN":
      url = activeBranch ? "/branch/dashboard" : "/company/dashboard";
      break;
    case "BRANCH_ADMIN":
      url = "/branch/dashboard";
      break;
    case "EMPLOYEE":
      url = "/employee/dashboard";
      break;
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL(url, request.url));
  }

  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/super-admin/:path*",
    "/company/:path*",
    "/branch/:path*",
    "/employee/:path*",
  ],
};