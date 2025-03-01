import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  let hostname = req.headers
    .get("host")!
    .replace("localhost:3000", `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`);

  // special case for Vercel preview deployment URLs
  if (
    hostname.includes("---") &&
    hostname.endsWith(`.${process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}`)
  ) {
    hostname = `${hostname.split("---")[0]}.${
      process.env.NEXT_PUBLIC_ROOT_DOMAIN
    }`;
  }

  const searchParams = req.nextUrl.searchParams.toString();
  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  if (hostname === "localhost:3000" || hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN) {

    if (path.startsWith("/posts/")) {
      // Let it pass through to the /posts/[slug] route
      return NextResponse.next();
    }
    // App routes - accessed directly without subdomain
    if (path.startsWith("/app")) {
      const session = await getToken({ req });
      if (!session && !path.startsWith("/app/login")) {
        return NextResponse.redirect(new URL("/app/login", req.url));
      } else if (session && path === "/app/login") {
        return NextResponse.redirect(new URL("/app", req.url));
      }
      return NextResponse.rewrite(
        new URL(`/app${path === "/app" ? "" : path.substring(4)}`, req.url)
      );
    }
        // Site routes - using /site/[subdomain] pattern
        if (path.startsWith("/site/") && path.split("/").length > 2) {
          const sitePath = path.split("/");
          const subdomain = sitePath[2];
          const rest = sitePath.slice(3).join("/");
          return NextResponse.rewrite(
            new URL(`/${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/${rest}`, req.url)
          );
        }
            // Root path handling
    if (path === "/") {
      return NextResponse.rewrite(new URL(`/home`, req.url));
    }
    
    // Let all other paths pass through normally
    return NextResponse.next();
  }

        

  // rewrite root application to `/home` folder
  if (
    hostname === "localhost:3000" ||
    hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN
  ) {
    return NextResponse.rewrite(
      new URL(`/home${path === "/" ? "" : path}`, req.url),
    );
  }

  // rewrite everything else to `/[domain]/[slug] dynamic route
  return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url));
}
