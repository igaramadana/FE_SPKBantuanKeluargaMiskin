import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function proxy(request) {
    const { nextUrl } = request;
    const token = request.nextauth.token;

    const isLoginPage = nextUrl.pathname.startsWith("/login");
    const isAdminPage = nextUrl.pathname.startsWith("/admin");
    const isUserPage = nextUrl.pathname.startsWith("/user");
    const isUbahPasswordPage =
      nextUrl.pathname.startsWith("/user/ubah-password");

    const role = token?.role;
    const mustChangePassword = Boolean(token?.mustChangePassword);

    if (isLoginPage && token) {
      return NextResponse.redirect(new URL("/dashboard-redirect", nextUrl));
    }

    if (isAdminPage && role !== "admin") {
      return NextResponse.redirect(new URL("/user/dashboard", nextUrl));
    }

    if (isUserPage && role !== "user") {
      return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
    }

    if (
      role === "user" &&
      mustChangePassword &&
      isUserPage &&
      !isUbahPasswordPage
    ) {
      return NextResponse.redirect(new URL("/user/ubah-password", nextUrl));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const pathname = req.nextUrl.pathname;

        if (pathname.startsWith("/login")) {
          return true;
        }

        if (pathname.startsWith("/admin") || pathname.startsWith("/user")) {
          return Boolean(token);
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/login", "/admin/:path*", "/user/:path*"],
};