import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getSession } from "@/lib/session";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = schema.parse(body);

    const exist = await prisma.user.findUnique({ where: { email } });
    if (exist) {
      return NextResponse.json({ ok: false, error: "Email already exists" }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        role: "USER",
        referralCode: crypto.randomUUID().slice(0, 8).toUpperCase(),
      },
    });

    const session = await getSession();
    session.user = {
      id: user.id,
      email: user.email,
      role: "USER",
    };
    await session.save();

    return NextResponse.json({ ok: true, id: user.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Registration failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}