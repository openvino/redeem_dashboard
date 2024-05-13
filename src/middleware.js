import { NextResponse } from "next/server";

import tokenVerify from "./pages/api/helpers/tokenVerify";
export async function middleware(request) {

  if (request.url.includes("/dashboard")) {
    const jwtoken = await tokenVerify(request);

    if (!jwtoken) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  return NextResponse.next();
}
