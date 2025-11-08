// src/controllers/modules.controller.js
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

// ✅ Create Module
export const createModule = async (req, res) => {
  try {
    const { key, label } = req.body;
    if (!key || !label) {
      return res.status(400).json({ message: "key and label are required" });
    }

    const newModule = await prisma.modules.create({
      data: {
        key,
        label,
      },
    });

    return res.status(201).json({
      message: "Module created successfully",
      data: {
        id: toNumber(newModule.id),
        key: newModule.key,
        label: newModule.label,
      },
    });
  } catch (error) {
    console.error("Error creating module:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ✅ Get All Modules
export const getAllModules = async (req, res) => {
  try {
    const modules = await prisma.modules.findMany({
      select: {
        id: true,
        key: true,
        label: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    if (modules.length === 0) {
      return res.status(404).json({ message: "No modules found" });
    }

    const formattedModules = modules.map(m => ({
      id: toNumber(m.id),
      key: m.key,
      label: m.label,
    }));

    return res.status(200).json({
      message: "Modules fetched successfully",
      data: formattedModules,
    });
  } catch (error) {
    console.error("Error fetching modules:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ✅ Delete Module
export const deleteModule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Module ID is required" });
    }

    const moduleId = parseInt(id);

    // Check if module exists
    const module = await prisma.modules.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    // Delete the module
    await prisma.modules.delete({
      where: { id: moduleId },
    });

    return res.status(200).json({
      message: "Module deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting module:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};