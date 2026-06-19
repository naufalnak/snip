import { NextRequest, NextResponse } from "next/server";

const RESERVED_PATHS = [
  "dashboard",
  "api",
  "not-found",
  "_next",
  "favicon.ico",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const slug = pathname.split("/")[1];

  if (RESERVED_PATHS.includes(slug)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
