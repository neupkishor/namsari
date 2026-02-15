'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';

async function checkAdmin() {
    const session = await getSession();
    if (!session?.id) return false;

    const user = await (prisma as any).account.findUnique({
        where: { id: parseInt(session.id) },
        include: { role: true }
    });

    if (!user) return false;

    return user.type === 'admin' || user.role?.name?.toLowerCase().includes('admin');
}

export async function getRoles() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { success: false, error: 'Unauthorized' };

  try {
    const roles = await (prisma as any).role.findMany({
      include: {
        permissions: true,
        _count: {
          select: { users: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    return { success: true, data: roles };
  } catch (error) {
    console.error('Error fetching roles:', error);
    return { success: false, error: 'Failed to fetch roles' };
  }
}

export async function getRole(id: number) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { success: false, error: 'Unauthorized' };

  try {
    const role = await (prisma as any).role.findUnique({
      where: { id },
      include: {
        permissions: true
      }
    });
    return { success: true, data: role };
  } catch (error) {
    console.error('Error fetching role:', error);
    return { success: false, error: 'Failed to fetch role' };
  }
}

export async function createRole(name: string, description: string, permissions: { resource: string, action: string }[]) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { success: false, error: 'Unauthorized' };

  try {
    const role = await (prisma as any).role.create({
      data: {
        name,
        description,
        permissions: {
          create: permissions
        }
      }
    });
    revalidatePath('/manage/permissions/roles');
    return { success: true, data: role };
  } catch (error) {
    console.error('Error creating role:', error);
    return { success: false, error: 'Failed to create role' };
  }
}

export async function updateRole(id: number, name: string, description: string, permissions: { resource: string, action: string }[]) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { success: false, error: 'Unauthorized' };

  try {
    // Transaction to update role and replace permissions
    const role = await prisma.$transaction(async (tx) => {
      // Update basic info
      const updatedRole = await (tx as any).role.update({
        where: { id },
        data: { name, description }
      });

      // Delete existing permissions
      await (tx as any).rolePermission.deleteMany({
        where: { roleId: id }
      });

      // Create new permissions
      if (permissions.length > 0) {
        await (tx as any).rolePermission.createMany({
          data: permissions.map((p: any) => ({
            roleId: id,
            resource: p.resource,
            action: p.action
          }))
        });
      }

      return updatedRole;
    });

    revalidatePath('/manage/permissions/roles');
    return { success: true, data: role };
  } catch (error) {
    console.error('Error updating role:', error);
    return { success: false, error: 'Failed to update role' };
  }
}

export async function deleteRole(id: number) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { success: false, error: 'Unauthorized' };

  try {
    await (prisma as any).role.delete({
      where: { id }
    });
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
    const users = await (prisma as any).account.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        type: true,
        role: {
          include: {
            permissions: true
          }
        },
        profile_picture: true,
        permissionsReceived: {
             include: {
                 owner: { select: { id: true, name: true, type: true } }
             }
        }
      },
      orderBy: { created_on: 'desc' }
    });
    return { success: true, data: users };
  } catch (error) {
    console.error('Error fetching users with roles:', error);
    return { success: false, error: 'Failed to fetch users' };
  }
}

export async function getUserPermissions(userId: number) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { success: false, error: 'Unauthorized' };

  try {
    const user = await (prisma as any).account.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        type: true,
        role: {
          include: {
            permissions: true
          }
        },
        permissionsReceived: {
            include: {
                owner: { select: { id: true, name: true, type: true } }
            }
        },
        permissionsGiven: {
            include: {
                actor: { select: { id: true, name: true, type: true } }
            }
        }
      }
    });
    return { success: true, data: user };
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return { success: false, error: 'Failed to fetch user permissions' };
  }
}

export async function assignRoleToUser(userId: number, roleId: number | null) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { success: false, error: 'Unauthorized' };

  try {
    const user = await (prisma as any).account.update({
      where: { id: userId },
      data: { roleId }
    });
    revalidatePath('/manage/permissions');
    revalidatePath(`/manage/permissions/${userId}`);
    return { success: true, data: user };
  } catch (error) {
    console.error('Error assigning role:', error);
    return { success: false, error: 'Failed to assign role' };
  }
}

export async function grantAccountPermission(ownerId: number, actorId: number, permissions: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { success: false, error: 'Unauthorized' };

    try {
      const perm = await (prisma as any).accountPermission.upsert({
        where: {
          ownerId_actorId: {
            ownerId,
            actorId
          }
        },
        update: {
          permissions
        },
        create: {
          ownerId,
          actorId,
          permissions
        }
      });
      revalidatePath('/manage/permissions');
      revalidatePath(`/manage/permissions/${actorId}`);
      return { success: true, data: perm };
    } catch (error) {
      console.error('Error granting permission:', error);
      return { success: false, error: 'Failed to grant permission' };
    }
  }
  
  export async function revokeAccountPermission(ownerId: number, actorId: number) {
      const isAdmin = await checkAdmin();
      if (!isAdmin) return { success: false, error: 'Unauthorized' };

      try {
          await (prisma as any).accountPermission.delete({
              where: {
                  ownerId_actorId: {
                      ownerId,
                      actorId
                  }
              }
          });
          revalidatePath('/manage/permissions');
          return { success: true };
      } catch (error) {
          console.error('Error revoking permission:', error);
          return { success: false, error: 'Failed to revoke permission' };
      }
  }