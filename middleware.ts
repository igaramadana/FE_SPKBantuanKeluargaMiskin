import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const path = req.nextUrl.pathname;

  const sudahLogin = Boolean(token);
  const role = token?.role as "admin" | "user" | undefined;

  const masukAdmin = path.startsWith("/admin");
  const masukUser = path.startsWith("/user");
  const masukLogin = path.startsWith("/login");

  if (!sudahLogin && (masukAdmin || masukUser)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (sudahLogin && masukLogin) {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    if (role === "user") {
      return NextResponse.redirect(new URL("/user/dashboard", req.url));
    }

    return NextResponse.redirect(new URL("/", req.url));
  }

  if (masukAdmin && role !== "admin") {
    return NextResponse.redirect(new URL("/user/dashboard", req.url));
  }

  if (masukUser && role !== "user") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/login"],
};