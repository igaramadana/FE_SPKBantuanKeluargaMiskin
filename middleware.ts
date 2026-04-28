import { auth } from "@/auth";
import { NextResponse, type NextRequest } from "next/server";

type MiddlewareRequest = NextRequest & {
  auth: {
    user?: {
      role?: "admin" | "user";
    };
  } | null;
};

export default auth((req: MiddlewareRequest) => {
  const sudahLogin = Boolean(req.auth);
  const role = req.auth?.user?.role;
  const path = req.nextUrl.pathname;

  const masukAdmin = path.startsWith("/admin");
  const masukUser = path.startsWith("/user");
  const masukLogin = path.startsWith("/login");

  if (!sudahLogin && (masukAdmin || masukUser)) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (sudahLogin && masukLogin) {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.nextUrl));
    }

    return NextResponse.redirect(new URL("/user/dashboard", req.nextUrl));
  }

  if (masukAdmin && role !== "admin") {
    return NextResponse.redirect(new URL("/user/dashboard", req.nextUrl));
  }

  if (masukUser && role !== "user") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/login"],
};