import { Types } from 'mongoose';
import crypto from 'crypto';
import connectDB from '@/lib/db/connection';
import { Tenant, User, Invitation } from '@/lib/db/models';
import { hashPassword } from '@/lib/utils/auth';
import { isValidSubdomain, normalizeSubdomain } from '@/lib/subdomain';

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export class OrgAdminService {
  static async getTenant(tenantId: Types.ObjectId) {
    await connectDB();
    const tenant = await Tenant.findById(tenantId).lean();
    if (!tenant) throw new Error('Tenant not found');
    return tenant;
  }

  static async updateTenant(
    tenantId: Types.ObjectId,
    data: { name?: string; subdomain?: string | null }
  ) {
    await connectDB();
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    if (data.name !== undefined) {
      tenant.name = data.name.trim();
    }

    if (data.subdomain !== undefined) {
      if (data.subdomain === null || data.subdomain === '') {
        tenant.subdomain = undefined;
      } else {
        const s = normalizeSubdomain(data.subdomain);
        if (!isValidSubdomain(s)) throw new Error('Invalid subdomain');
        const taken = await Tenant.findOne({ subdomain: s, _id: { $ne: tenantId } });
        if (taken) throw new Error('Subdomain is already taken');
        tenant.subdomain = s;
      }
    }

    await tenant.save();
    return tenant.toObject();
  }

  static async listUsers(tenantId: Types.ObjectId) {
    await connectDB();
    return User.find({ tenantId })
      .select('_id email name role emailVerified createdAt')
      .sort({ createdAt: 1 })
      .lean();
  }

  static async updateUserRole(
    tenantId: Types.ObjectId,
    targetUserId: Types.ObjectId,
    role: 'admin' | 'user',
    actorUserId: string
  ) {
    await connectDB();
    const target = await User.findOne({ _id: targetUserId, tenantId });
    if (!target) throw new Error('User not found');

    if (target.role === 'admin' && role === 'user') {
      const adminCount = await User.countDocuments({ tenantId, role: 'admin' });
      if (adminCount <= 1) throw new Error('Cannot remove the last organisation admin');
    }

    target.role = role;
    await target.save();
    return target.toObject();
  }

  static async removeUser(
    tenantId: Types.ObjectId,
    targetUserId: Types.ObjectId,
    actorUserId: string
  ) {
    await connectDB();
    if (targetUserId.toString() === actorUserId) {
      throw new Error('You cannot remove yourself');
    }

    const target = await User.findOne({ _id: targetUserId, tenantId });
    if (!target) throw new Error('User not found');

    if (target.role === 'admin') {
      const adminCount = await User.countDocuments({ tenantId, role: 'admin' });
      if (adminCount <= 1) throw new Error('Cannot remove the last organisation admin');
    }

    await User.deleteOne({ _id: targetUserId, tenantId });
    return { ok: true };
  }

  static async listInvitations(tenantId: Types.ObjectId) {
    await connectDB();
    return Invitation.find({ tenantId, usedAt: { $exists: false }, expiresAt: { $gt: new Date() } })
      .sort({ createdAt: -1 })
      .lean();
  }

  static async createInvitation(
    tenantId: Types.ObjectId,
    email: string,
    role: 'admin' | 'user',
    invitedBy: Types.ObjectId
  ) {
    await connectDB();
    const normalized = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalized });
    if (existingUser) {
      if (existingUser.tenantId.equals(tenantId)) {
        throw new Error('This person is already a member of your organisation');
      }
      throw new Error('This email already has a LynQ account. They must use a different email for this organisation.');
    }

    const pending = await Invitation.findOne({
      tenantId,
      email: normalized,
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });
    if (pending) throw new Error('An invitation is already pending for this email');

    const token = crypto.randomBytes(32).toString('hex');
    const inv = await Invitation.create({
      tenantId,
      email: normalized,
      token,
      role,
      invitedBy,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    });

    return inv.toObject();
  }

  static async cancelInvitation(tenantId: Types.ObjectId, invitationId: Types.ObjectId) {
    await connectDB();
    const res = await Invitation.deleteOne({ _id: invitationId, tenantId, usedAt: { $exists: false } });
    if (res.deletedCount === 0) throw new Error('Invitation not found or already used');
    return { ok: true };
  }

  static async getInvitationByToken(token: string) {
    await connectDB();
    const inv = await Invitation.findOne({ token }).populate('tenantId', 'name subdomain').lean();
    if (!inv) return null;
    if (inv.usedAt) return null;
    if (new Date(inv.expiresAt) < new Date()) return null;
    return inv;
  }

  static async acceptInvitation(token: string, name: string, password: string) {
    await connectDB();
    const inv = await Invitation.findOne({ token });
    if (!inv || inv.usedAt || new Date(inv.expiresAt) < new Date()) {
      throw new Error('Invalid or expired invitation');
    }

    const email = inv.email.toLowerCase().trim();
    const existing = await User.findOne({ email });
    if (existing) {
      throw new Error('This email already has a LynQ account');
    }

    const passwordHash = await hashPassword(password);
    await User.create({
      tenantId: inv.tenantId,
      email,
      passwordHash,
      name: name.trim(),
      role: inv.role,
      emailVerified: true,
    });

    inv.usedAt = new Date();
    await inv.save();

    return { email, tenantId: inv.tenantId.toString() };
  }
}
