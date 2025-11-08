// src/controllers/permission.controller.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Utility: Convert to number safely (for Decimal/BigInt)
const toNumber = (val) => {
  if (val == null) return 0;
  if (typeof val === 'object' && typeof val.toNumber === 'function') {
    return val.toNumber();
  }
  return Number(val);
};

// ✅ Create Permission
export const createPermission = async (req, res) => {
  try {
    const { role_id, module_name, can_create, can_view, can_update, can_delete, full_access } = req.body;

    if (!role_id || !module_name) {
      return res.status(400).json({ success: false, message: "role_id and module_name are required" });
    }

    const newPermission = await prisma.role_module_permissions.create({
      data: {
        role_id: parseInt(role_id),
        module_name,
        can_create: can_create || "0",
        can_view: can_view || "0",
        can_update: can_update || "0",
        can_delete: can_delete || "0",
        full_access: full_access || "0",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Permission created successfully",
      data: {
        ...newPermission,
        id: toNumber(newPermission.id),
        role_id: toNumber(newPermission.role_id),
      },
    });
  } catch (error) {
    console.error("Error creating permission:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create permission",
      error: error.message,
    });
  }
};

// ✅ Get All Permissions
export const getAllPermissions = async (req, res) => {
  try {
    const permissions = await prisma.role_module_permissions.findMany({
      orderBy: { id: "asc" },
    });

    const formatted = permissions.map(p => ({
      ...p,
      id: toNumber(p.id),
      role_id: toNumber(p.role_id),
    }));

    return res.status(200).json({
      success: true,
      message: "Permissions fetched successfully",
      data: formatted,
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch permissions",
      error: error.message,
    });
  }
};

// ✅ Get Permission by ID
export const getPermissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const permissionId = parseInt(id);

    if (!permissionId) {
      return res.status(400).json({ success: false, message: "Valid permission ID is required" });
    }

    const permission = await prisma.role_module_permissions.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      return res.status(404).json({ success: false, message: "Permission not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Permission fetched successfully",
      data: {
        ...permission,
        id: toNumber(permission.id),
        role_id: toNumber(permission.role_id),
      },
    });
  } catch (error) {
    console.error("Error fetching permission by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch permission",
      error: error.message,
    });
  }
};

// ✅ Update Permission
export const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_id, module_name, can_create, can_view, can_update, can_delete, full_access } = req.body;

    const permissionId = parseInt(id);
    if (!permissionId) {
      return res.status(400).json({ success: false, message: "Valid permission ID is required" });
    }

    const existing = await prisma.role_module_permissions.findUnique({
      where: { id: permissionId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Permission not found" });
    }

    const updated = await prisma.role_module_permissions.update({
      where: { id: permissionId },
      data: {
        role_id: role_id ? parseInt(role_id) : existing.role_id,
        module_name: module_name || existing.module_name,
        can_create: can_create || "0",
        can_view: can_view || "0",
        can_update: can_update || "0",
        can_delete: can_delete || "0",
        full_access: full_access || "0",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Permission updated successfully",
      data: {
        ...updated,
        id: toNumber(updated.id),
        role_id: toNumber(updated.role_id),
      },
    });
  } catch (error) {
    console.error("Error updating permission:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update permission",
      error: error.message,
    });
  }
};

// ✅ Delete Permission
export const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const permissionId = parseInt(id);

    if (!permissionId) {
      return res.status(400).json({ success: false, message: "Valid permission ID is required" });
    }

    const existing = await prisma.role_module_permissions.findUnique({
      where: { id: permissionId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Permission not found" });
    }

    await prisma.role_module_permissions.delete({
      where: { id: permissionId },
    });

    return res.status(200).json({
      success: true,
      message: "Permission deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting permission:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete permission",
      error: error.message,
    });
  }
};