import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import { requireUserApi } from "@/lib/auth";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function GET() {
  if (process.env.AUTH_DEV_OPEN === '1') {
    const items = await prisma.deposit.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ ok: true, items });
  }

  const user = await requireUserApi();
  if (!("id" in user)) return user; // Handle 401 from requireUserApi

  const items = await prisma.deposit.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const devOpen = process.env.AUTH_DEV_OPEN === '1';
  const user = devOpen ? { id: 'dev-bypass', email: 'dev@example.com', role: 'USER' } : await requireUserApi();
  if (!("id" in user)) return user; // Handle 401 from requireUserApi

  try {
    const fd = await req.formData();
    const amount = Number(fd.get("amount") ?? 0);
    const txId = String(fd.get("txId") ?? "");
    const network = String(fd.get("network") ?? "TRC20");
    const proof = fd.get("proof");

    if (!amount || !txId || !(proof instanceof File)) {
      return NextResponse.json({ ok: false, error: "missing fields" }, { status: 400 });
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const safeName = (proof.name || "proof").replace(/[^\w.\-()\s]/g, "").trim();
    const fileName = `${Date.now()}-${safeName}`;
    const absPath = path.join(UPLOAD_DIR, fileName);

    const buf = Buffer.from(await proof.arrayBuffer());
    await fs.writeFile(absPath, buf);

    const proofImageUrl = `/uploads/${fileName}`;

    const created = await prisma.deposit.create({
      data: {
        amount,
        txId,
        network,
        proofImageUrl,
        status: "PENDING",
        toAddress: process.env.NEXT_PUBLIC_COMPANY_ADDRESS ?? "TKaAamEouHjG9nZwoTPhgYUerejbBHGMop",
        userId: user.id,
      },
    });

    return NextResponse.json({ ok: true, id: created.id, proofImageUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}