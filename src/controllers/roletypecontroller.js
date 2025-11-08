import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Utility: Convert to number safely (for Decimal/BigInt) - Not strictly needed for role_types, but kept for consistency.
const toNumber = (val) => {
  if (val == null) return 0;
  if (typeof val === 'object' && typeof val.toNumber === 'function') {
    return val.toNumber();
  }
  return Number(val);
};

// ✅ Create Role Type
export const createRoleType = async (req, res) => {
  try {
    const { type_name } = req.body;
    if (!type_name) {
      return res.status(400).json({ status: false, message: "type_name is required" });
    }

    const newRoleType = await prisma.role_types.create({
      data: {
        type_name,
      },
    });

    res.status(201).json({ status: true, message: "Role Type created successfully", data: newRoleType });
  } catch (error) {
    console.error("Error creating role type:", error);
    res.status(500).json({ status: false, message: error.message });
  }
};

// ✅ Get All Role Types
export const getAllRoleTypes = async (req, res) => {
  try {
    const roleTypes = await prisma.role_types.findMany();

    res.json({ status: true, message: "Role Types fetched successfully", data: roleTypes });
  } catch (error) {
    console.error("Error fetching role types:", error);
    res.status(500).json({ status: false, message: error.message });
  }
};

// ✅ Update Role Type
export const updateRoleType = async (req, res) => {
  try {
    const { id } = req.params;
    const { type_name } = req.body;

    if (!type_name) {
      return res.status(400).json({ status: false, message: "type_name is required" });
    }

    // Find the existing role type
    const existingRoleType = await prisma.role_types.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingRoleType) {
      return res.status(404).json({ status: false, message: "Role Type not found" });
    }

    // Update the role type
    const updatedRoleType = await prisma.role_types.update({
      where: { id: parseInt(id) },
      data: {
        type_name,
      },
    });

    res.json({ status: true, message: "Role Type updated successfully", data: updatedRoleType });
  } catch (error) {
    console.error("Error updating role type:", error);
    res.status(500).json({ status: false, message: error.message });
  }
};

// ✅ Delete Role Type
export const deleteRoleType = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the role type first to check existence (optional, but good for user feedback)
    const existingRoleType = await prisma.role_types.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingRoleType) {
      return res.status(404).json({ status: false, message: "Role Type not found" });
    }

    // Delete the role type
    const deletedRoleType = await prisma.role_types.delete({
      where: { id: parseInt(id) },
    });

    res.json({ status: true, message: "Role Type deleted successfully", data: deletedRoleType });
  } catch (error) {
    // Check if the error is because the record doesn't exist (Prisma will throw an error)
    if (error.code === 'P2025') { // Record to delete does not exist
      return res.status(404).json({ status: false, message: "Role Type not found" });
    }
    console.error("Error deleting role type:", error);
    res.status(500).json({ status: false, message: error.message });
  }
};