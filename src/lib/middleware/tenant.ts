import { Types } from 'mongoose';
import { SessionUser } from '@/types';

export class TenantContext {
  tenantId: Types.ObjectId;
  user: SessionUser;

  constructor(tenantId: Types.ObjectId, user: SessionUser) {
    this.tenantId = tenantId;
    this.user = user;
  }

  getTenantFilter() {
    return { tenantId: this.tenantId };
  }

  isAdmin(): boolean {
    return this.user.role === 'admin';
  }
}

export function createTenantContext(user: SessionUser): TenantContext {
  const tenantId = new Types.ObjectId(user.tenantId);
  return new TenantContext(tenantId, user);
}

// Helper to add tenant filter to any query
export function withTenantScope<T extends { tenantId?: any }>(
  data: T,
  tenantContext: TenantContext
): T {
  return {
    ...data,
    tenantId: tenantContext.tenantId,
  };
}
