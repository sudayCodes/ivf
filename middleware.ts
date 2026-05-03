import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = ["/patient", "/nurse", "/doctor"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("sb-auth-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Validate the JWT against Supabase — getUser() verifies server-side
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  if (!user) {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("sb-auth-token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/patient/:path*", "/nurse/:path*", "/doctor/:path*"],
};
