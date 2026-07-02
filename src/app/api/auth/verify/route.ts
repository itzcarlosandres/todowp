import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const email = req.nextUrl.searchParams.get("email");

  if (!token || !email) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?verified=error`);
  }

  try {
    const record = await db.verificationToken.findFirst({
      where: { identifier: email.toLowerCase(), token },
    });

    if (!record || record.expires < new Date()) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?verified=expired`);
    }

    await db.user.update({
      where: { email: email.toLowerCase() },
      data: { emailVerified: new Date() },
    });

    await db.verificationToken.delete({ where: { identifier_token: { identifier: email.toLowerCase(), token } } });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?verified=ok`);
  } catch {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?verified=error`);
  }
}
