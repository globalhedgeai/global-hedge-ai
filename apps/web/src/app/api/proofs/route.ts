import { NextRequest } from 'next/server';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const key = url.searchParams.get('key');
  if (!key) return new Response(JSON.stringify({ok:false,error:'missing key'}), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });

  const local = key.replace(/^\/+/, '');
  const abs = path.join(process.cwd(), 'public', local);

  try {
    const data = await fs.readFile(abs);
    const ext = path.extname(abs).toLowerCase();
    const type =
      ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
      ext === '.png' ? 'image/png' :
      ext === '.webp' ? 'image/webp' :
      'application/octet-stream';

    return new Response(new Uint8Array(data).buffer, {
      status: 200,
      headers: {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return new Response(JSON.stringify({ok:false,error:'not found'}), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}