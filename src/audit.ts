import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

function defaultAuditDir() {
  return process.env.VERCEL ? '/tmp/agentpay/audit' : '.agentpay/audit';
}

export async function writeAudit(payload: unknown, auditDir = defaultAuditDir()) {
  await mkdir(auditDir, { recursive: true });
  const id = `audit_${new Date().toISOString().replaceAll(':', '-')}_${Math.random().toString(36).slice(2, 8)}`;
  const path = join(auditDir, `${id}.json`);
  await writeFile(path, JSON.stringify(payload, null, 2));
  return { id, path };
}
