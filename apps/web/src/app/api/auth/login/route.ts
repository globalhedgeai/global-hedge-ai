import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getSession } from "@/lib/session";

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 400 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 400 });
    }

    const session = await getSession();
    session.user = {
      id: user.id,
      email: user.email,
      role: user.role === "ADMIN" ? "ADMIN" : "USER",
    };
    await session.save();

    return NextResponse.json({ ok: true, id: user.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Login failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}