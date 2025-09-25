import { execSync, spawn } from 'node:child_process'
import * as http from 'node:http'

function sh(cmd: string, cwd = process.cwd()) {
  console.log('\n$ ' + cmd)
  execSync(cmd, { stdio: 'inherit', cwd, env: process.env, shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh' })
}

async function checkHealth() {
  const pn = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
  const dev = spawn(pn, ['dev'], { cwd: 'apps/web', stdio: 'pipe', shell: true })
  await new Promise((r) => setTimeout(r, 6500))
  const body = await new Promise<string>((resolve) => {
    const req = http.get('http://localhost:3000/api/health', (res) => {
      let data = ''; res.on('data', c => data += c); res.on('end', () => resolve(data))
    }); req.on('error', () => resolve('ERROR'))
  })
  try { dev.kill() } catch {}
  console.log('\n[health] => ' + body)
  if (!/\"ok\"\s*:\s*true/.test(body)) throw new Error('Health check failed')
}

async function main() {
  sh('pnpm exec tsc -p tsconfig.json --noEmit', 'apps/web')
  sh('pnpm exec next lint --max-warnings=0', 'apps/web')
  sh('pnpm dlx prisma validate', '.')
  await checkHealth()
  sh('pnpm exec next build', 'apps/web')
  console.log('\n✅ Preflight passed')
}

main().catch((e) => { console.error('\n❌ Preflight failed:', e?.message || e); process.exit(1) })