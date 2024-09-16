import { NextRequest, NextResponse } from "next/server";


export const middleware = async (request: NextRequest) => {
    const cookie = request.cookies.get("JWT_TOKEN");
    const frontIp = process.env.SERVER_FRONTEND || "http://localhost:3000";
    
    if (!cookie) return  NextResponse.redirect(`${frontIp}`);
    
    const res = await fetch(`http://back:4000/user/me`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cookie.value}`,
      },
    });

    if (!res.ok) return  NextResponse.redirect(`${frontIp}`);
    
    return NextResponse.next();
}

export const config = {
  matcher: ["/Chat/:path*", "/Profile/:path*", "/Settings/:path*"],
};