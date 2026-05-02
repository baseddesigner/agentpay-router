import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

function defaultAuditDir() {
  return process.env.VERCEL ? '/tmp/agentpay/audit' : '.agentpay/audit';
}

function auditStorage(auditDir: string) {
  return auditDir.startsWith('/tmp/') ? 'ephemeral_serverless' : 'local_file';
}

function auditSummary(payload: any) {
  const failedChecks = (payload?.policyChecks ?? []).filter((check: { status?: string }) => check.status === 'fail');
  return {
    decision: failedChecks.length === 0 ? 'approved' : 'blocked',
    status: payload?.status,
    quoteId: payload?.quote?.id,
    chainId: payload?.quote?.chainId,
    sell: payload?.quote?.sell,
    buy: payload?.quote?.buy,
    amount: payload?.quote?.amount,
    wallet: payload?.wallet,
    handoffHash: payload?.handoffHash,
    failedChecks: failedChecks.map((check: { name?: string }) => check.name).filter(Boolean),
  };
}

export async function writeAudit(payload: unknown, auditDir = defaultAuditDir()) {
  await mkdir(auditDir, { recursive: true });
  const id = `audit_${new Date().toISOString().replaceAll(':', '-')}_${Math.random().toString(36).slice(2, 8)}`;
  const path = join(auditDir, `${id}.json`);
  await writeFile(path, JSON.stringify(payload, null, 2));
  return { id, path, storage: auditStorage(auditDir), summary: auditSummary(payload) };
}
