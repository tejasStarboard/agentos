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

/** In-memory approvals store (v1). */
export function createApprovalsStore() {
  const byId = new Map<string, Approval>();

  return {
    create(input: {
      title: string;
      body?: string;
      metadata?: Record<string, unknown>;
    }): Approval {
      const approval: Approval = {
        id: crypto.randomUUID(),
        title: input.title,
        ...(input.body !== undefined ? { body: input.body } : {}),
        ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      byId.set(approval.id, approval);
      return approval;
    },

    list(status?: ApprovalStatus): Approval[] {
      const all = [...byId.values()].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      );
      if (!status) return all;
      return all.filter((a) => a.status === status);
    },

    get(id: string): Approval | undefined {
      return byId.get(id);
    },

    resolve(
      id: string,
      decision: 'approved' | 'rejected',
    ): Approval | undefined {
      const existing = byId.get(id);
      if (!existing) return undefined;
      if (existing.status !== 'pending') return existing;
      const updated: Approval = {
        ...existing,
        status: decision,
        resolvedAt: new Date().toISOString(),
      };
      byId.set(id, updated);
      return updated;
    },
  };
}

export type ApprovalsStore = ReturnType<typeof createApprovalsStore>;
