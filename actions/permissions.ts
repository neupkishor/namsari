'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';

type RolePermInput = { resource: string; action: string };

async function checkAdmin() {
  const session = await getSession();
  if (!session?.id) return false;

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.id) },
    include: { role: true },
  });

  if (!user) return false;
  return user.type === 'admin' || user.role?.role?.toLowerCase().includes('admin');
}

async function ensurePermissionIds(permissions: RolePermInput[]) {
  const ids: number[] = [];
  for (const p of permissions) {
    const permission = await prisma.rolePermission.upsert({
      where: {
        resource_action: {
          resource: p.resource,
          action: p.action,
        },
      },
      update: {},
      create: {
        resource: p.resource,
        action: p.action,
      },
    });
    ids.push(permission.id);
  }
  return ids;
}

function parseRolePermissions(role: any): RolePermInput[] {
  if (!role?.permissions) return [];
  if (Array.isArray(role.permissions)) return role.permissions as RolePermInput[];
  return [];
}

export async function getRoles() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { success: false, error: 'Unauthorized' };

  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: { select: { users: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    const formatted = roles.map((role) => ({
      ...role,
      name: role.role,
      permissions: parseRolePermissions(role),
    }));

    return { success: true, data: formatted };
  } catch (error) {
    console.error('Error fetching roles:', error);
    return { success: false, error: 'Failed to fetch roles' };
  }
}

export async function getRole(id: number) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { success: false, error: 'Unauthorized' };

  try {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) return { success: true, data: null };

    return {
      success: true,
      data: {
        ...role,
        name: role.role,
        permissions: parseRolePermissions(role),
      },
    };
  } catch (error) {
    console.error('Error fetching role:', error);
    return { success: false, error: 'Failed to fetch role' };
  }
}

export async function createRole(name: string, description: string, permissions: RolePermInput[]) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { success: false, error: 'Unauthorized' };

  try {
    const permissionIds = await ensurePermissionIds(permissions);

    const role = await prisma.role.create({
      data: {
        role: name,
        description,
        permissions: permissions,
      },
    });

    if (permissionIds.length > 0) {
      await prisma.rolePermissionMap.createMany({
        data: permissionIds.map((permissionId) => ({
          role_id: role.id,
          permission_id: permissionId,
        })),
        skipDuplicates: true,
      });
    }

    revalidatePath('/manage/permissions/roles');
    return { success: true, data: { ...role, name: role.role, permissions } };
  } catch (error) {
    console.error('Error creating role:', error);
    return { success: false, error: 'Failed to create role' };
  }
}

export async function updateRole(id: number, name: string, description: string, permissions: RolePermInput[]) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { success: false, error: 'Unauthorized' };

  try {
    const permissionIds = await ensurePermissionIds(permissions);

    const role = await prisma.role.update({
      where: { id },
      data: {
        role: name,
        description,
        permissions: permissions,
      },
    });

    await prisma.rolePermissionMap.deleteMany({ where: { role_id: id } });
    if (permissionIds.length > 0) {
      await prisma.rolePermissionMap.createMany({
        data: permissionIds.map((permissionId) => ({
          role_id: id,
          permission_id: permissionId,
        })),
        skipDuplicates: true,
      });
    }

    revalidatePath('/manage/permissions/roles');
    return { success: true, data: { ...role, name: role.role, permissions } };
  } catch (error) {
    console.error('Error updating role:', error);
    return { success: false, error: 'Failed to update role' };
  }
}

export async function deleteRole(id: number) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { success: false, error: 'Unauthorized' };

  try {
    await prisma.role.delete({ where: { id } });
    revalidatePath('/manage/permissions/roles');
    return { success: true };
  } catch (error) {
    console.error('Error deleting role:', error);
    return { success: false, error: 'Failed to delete role' };
  }
}

export async function getUsersWithRoles() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { success: false, error: 'Unauthorized' };

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        type: true,
        role: true,
        profile_picture: true,
        permissionsReceived: {
          include: {
            owner: { select: { id: true, name: true, type: true } },
          },
        },
      },
      orderBy: { created_on: 'desc' },
    });

    const formatted = users.map((u) => ({
      ...u,
      role: u.role
        ? {
            ...u.role,
            name: u.role.role,
            permissions: parseRolePermissions(u.role),
          }
        : null,
    }));

    return { success: true, data: formatted };
  } catch (error) {
    console.error('Error fetching users with roles:', error);
    return { success: false, error: 'Failed to fetch users' };
  }
}

export async function getUserPermissions(userId: number) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { success: false, error: 'Unauthorized' };

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        type: true,
        role: true,
        permissionsReceived: {
          include: {
            owner: { select: { id: true, name: true, type: true } },
          },
        },
        permissionsGiven: {
          include: {
            actor: { select: { id: true, name: true, type: true } },
          },
        },
      },
    });

    if (!user) return { success: true, data: null };

    const formatted = {
      ...user,
      role: user.role
        ? {
            ...user.role,
            name: user.role.role,
            permissions: parseRolePermissions(user.role),
          }
        : null,
    };

    return { success: true, data: formatted };
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return { success: false, error: 'Failed to fetch user permissions' };
  }
}

export async function assignRoleToUser(userId: number, roleId: number | null) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { success: false, error: 'Unauthorized' };

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { roleId },
    });
    revalidatePath('/manage/permissions');
    revalidatePath(`/manage/permissions/${userId}`);
    return { success: true, data: user };
  } catch (error) {
    console.error('Error assigning role:', error);
    return { success: false, error: 'Failed to assign role' };
  }
}

export async function grantUserPermission(ownerId: number, actorId: number, permissions: string) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { success: false, error: 'Unauthorized' };

  try {
    const perm = await prisma.userPermission.upsert({
      where: {
        ownerId_actorId: {
          ownerId,
          actorId,
        },
      },
      update: {
        permissions,
      },
      create: {
        ownerId,
        actorId,
        permissions,
      },
    });
    revalidatePath('/manage/permissions');
    revalidatePath(`/manage/permissions/${actorId}`);
    return { success: true, data: perm };
  } catch (error) {
    console.error('Error granting permission:', error);
    return { success: false, error: 'Failed to grant permission' };
  }
}

export async function revokeUserPermission(ownerId: number, actorId: number) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { success: false, error: 'Unauthorized' };

  try {
    await prisma.userPermission.delete({
      where: {
        ownerId_actorId: {
          ownerId,
          actorId,
        },
      },
    });
    revalidatePath('/manage/permissions');
    return { success: true };
  } catch (error) {
    console.error('Error revoking permission:', error);
    return { success: false, error: 'Failed to revoke permission' };
  }
}
