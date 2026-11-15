/**
 * @agentos/core/api/hitl — HTTP client for builtin `hitl` (ticket 23).
 */

import { getJson, postJson, resolveExtApiBase, type EnvMap } from './http';

/** Resolve builtin hitl API base (`…/api/ext/hitl` or test override). */
export function resolveHitlApiBase(env: EnvMap = Bun.env): string {
  return resolveExtApiBase('hitl', 'AGENT_OS_HITL_API_BASE', env);
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type Approval = {
  id: string;
  title: string;
  body?: string;
  metadata?: Record<string, unknown>;
  status: ApprovalStatus;
  createdAt: string;
  resolvedAt?: string;
};

export type CreateApprovalInput = {
  title: string;
  body?: string;
  metadata?: Record<string, unknown>;
};

export type ListApprovalsResult = { approvals: Approval[] };

export async function listApprovals(
  status?: ApprovalStatus,
  env?: EnvMap,
): Promise<Approval[]> {
  const base = resolveHitlApiBase(env ?? Bun.env);
  const url = status
    ? `${base}/approvals?status=${encodeURIComponent(status)}`
    : `${base}/approvals`;
  const result = await getJson<ListApprovalsResult>(url, 'hitl listApprovals');
  return result.approvals;
}

export async function createApproval(
  input: CreateApprovalInput,
  env?: EnvMap,
): Promise<Approval> {
  const base = resolveHitlApiBase(env ?? Bun.env);
  return postJson<Approval>(`${base}/approvals`, input, 'hitl createApproval');
}

export async function resolveApproval(
  id: string,
  decision: 'approved' | 'rejected',
  env?: EnvMap,
): Promise<Approval> {
  const base = resolveHitlApiBase(env ?? Bun.env);
  return postJson<Approval>(
    `${base}/approvals/${encodeURIComponent(id)}/resolve`,
    { decision },
    'hitl resolveApproval',
  );
}
