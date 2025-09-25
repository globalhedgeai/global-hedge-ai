import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export async function GET() {
  const details: Record<string, unknown> = { ok: true };

  try {
    await prisma.$queryRaw`SELECT 1 as ok`;
    details.db = 'ok';
  } catch (e) {
    details.ok = false;
    details.db = e instanceof Error ? e.message : 'db error';
  }

  try {
    const dir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(dir, { recursive: true });
    const p = path.join(dir, '.__health.tmp');
    await fs.writeFile(p, 'ok');
    await fs.unlink(p);
    details.fs = 'ok';
  } catch (e) {
    details.ok = false;
    details.fs = e instanceof Error ? e.message : 'fs error';
  }

  return NextResponse.json(details, { status: details.ok ? 200 : 500 });
}