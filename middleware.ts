import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const response = NextResponse.next();
if (req.nextUrl.pathname.startsWith("/api/dashboard")) {
     
}
  return response;
}
