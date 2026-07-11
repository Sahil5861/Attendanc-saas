import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIES = ["access_token", "user", "role", "active_branch_id"];

function isTokenExpired(token?: string) {
  if (!token) return true;

  try {
    const payloadPart = token.split(".")[1] || "";
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(padded));

    if (!payload?.exp) return false;

    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("session", "expired");
  const response = NextResponse.redirect(loginUrl);

  AUTH_COOKIES.forEach((name) => {
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
    });
  });
  

  return response;
}

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

  const hasValidToken = Boolean(token) && !isTokenExpired(token);

  if (isProtected && !hasValidToken) {
    return redirectToLogin(request);
  }

  let url = "";
  switch (role) {
    case "SUPER_ADMIN":
      url = "/super-admin/dashboard";
      break;
    case "COMPANY_ADMIN":
      url = activeBranch ? "/branch/dashboard" : "/company/dashboard";
      break;
    case "BRANCH_MANAGER":
      url = "/branch/dashboard";
      break;
    case "EMPLOYEE":
      url = "/employee/dashboard";
      break;
  }

  if (hasValidToken && isAuthPage) {
    return NextResponse.redirect(new URL(url, request.url));
  }

  if (token && !hasValidToken) {
    return redirectToLogin(request);
  }

  if (hasValidToken && path.startsWith("/branch") && !activeBranch && role === "COMPANY_ADMIN") {
    return NextResponse.redirect(new URL("/company/dashboard", request.url));
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
