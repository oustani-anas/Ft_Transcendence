import { NextRequest, NextResponse } from "next/server";


export const middleware = async (request: NextRequest) => {
    const cookie = request.cookies.get("JWT_TOKEN");
    // const frontIp = process.env.SERVER_FRONTEND || "http://localhost:3000";
    const frontIp = process.env.SERVER_FRONTEND;
    const back = process.env.BACKEND_URL;
    if (!cookie) return  NextResponse.redirect(`${frontIp}`);
    
    try {

      // const res = await fetch(`http://localhost:4000/user/me`, {
      const res = await fetch(`${back}/user/me`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookie.value}`,
        },
      });
      
      if (!res.ok) return  NextResponse.redirect(`${frontIp}`);
    } catch(error) {
      console.error('error fetching data', error);
      return NextResponse.redirect(`${frontIp}`);
    }
    
    return NextResponse.next();
}

export const config = {
  matcher: ["/Chat/:path*", "/Profile/:path*", "/Settings/:path*"],
};