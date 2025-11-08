// src/controllers/subgroup.controller.js

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ✅ Create Subgroup
export const createSubgroup = async (req, res) => {
  try {
    const { name, company_id, category_id } = req.body;

    if (!name || !company_id || !category_id) {
      return res.status(400).json({ success: false, message: "Name, company_id and category_id are required" });
    }

    // Check if company exists
    const company = await prisma.companies.findUnique({ where: { id: parseInt(company_id) } });
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    // Check if category exists
    const category = await prisma.categories.findUnique({ where: { id: parseInt(category_id) } });
    if (!category || category.deleted_at) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const subgroup = await prisma.subgroups.create({
      data: {
        name,
        company_id: parseInt(company_id),
        category_id: parseInt(category_id),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Subgroup created successfully",
      data: subgroup,
    });
  } catch (error) {
    console.error("Error creating subgroup:", error);
    return res.status(500).json({ success: false, message: "Failed to create subgroup", error: error.message });
  }
};

// ✅ Get All Subgroups (include category)
export const getAllSubgroups = async (req, res) => {
  try {
    const subgroups = await prisma.subgroups.findMany({
      where: { deleted_at: { equals: null } },
      include: { category: { select: { id: true, name: true } } },
      orderBy: { id: "desc" },
    });

    return res.status(200).json({
      success: true,
      message: "All subgroups retrieved",
      data: subgroups,
    });
  } catch (error) {
    console.error("Error fetching subgroups:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch subgroups", error: error.message });
  }
};

// ✅ Get Subgroups by Category
export const getSubgroupsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category_id = parseInt(categoryId);

    if (isNaN(category_id)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    const subgroups = await prisma.subgroups.findMany({
      where: { category_id, deleted_at: null },
      orderBy: { id: "desc" },
    });

    return res.status(200).json({
      success: true,
      message: "Subgroups retrieved by category",
      data: subgroups,
    });
  } catch (error) {
    console.error("Error fetching subgroups by category:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch subgroups", error: error.message });
  }
};

// ✅ Update Subgroup
export const updateSubgroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, company_id, category_id } = req.body;
    const subgroupId = parseInt(id);

    if (isNaN(subgroupId)) {
      return res.status(400).json({ success: false, message: "Invalid subgroup ID" });
    }

    const existing = await prisma.subgroups.findUnique({ where: { id: subgroupId } });
    if (!existing || existing.deleted_at) {
      return res.status(404).json({ success: false, message: "Subgroup not found" });
    }

    // Optional: Validate new company_id or category_id
    if (company_id) {
      const company = await prisma.companies.findUnique({ where: { id: parseInt(company_id) } });
      if (!company) return res.status(404).json({ success: false, message: "Company not found" });
    }
    if (category_id) {
      const category = await prisma.categories.findUnique({ where: { id: parseInt(category_id) } });
      if (!category || category.deleted_at) return res.status(404).json({ success: false, message: "Category not found" });
    }

    const updated = await prisma.subgroups.update({
      where: { id: subgroupId },
      data: {
        name: name || existing.name,
        company_id: company_id ? parseInt(company_id) : existing.company_id,
        category_id: category_id ? parseInt(category_id) : existing.category_id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Subgroup updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating subgroup:", error);
    return res.status(500).json({ success: false, message: "Failed to update subgroup", error: error.message });
  }
};

// ✅ Soft Delete Subgroup
export const deleteSubgroup = async (req, res) => {
  try {
    const { id } = req.params;
    const subgroupId = parseInt(id);

    if (isNaN(subgroupId)) {
      return res.status(400).json({ success: false, message: "Invalid subgroup ID" });
    }

    const existing = await prisma.subgroups.findUnique({ where: { id: subgroupId } });
    if (!existing || existing.deleted_at) {
      return res.status(404).json({ success: false, message: "Subgroup not found" });
    }

    await prisma.subgroups.update({
      where: { id: subgroupId },
      data: { deleted_at: new Date() },
    });

    return res.status(200).json({
      success: true,
      message: "Subgroup deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting subgroup:", error);
    return res.status(500).json({ success: false, message: "Failed to delete subgroup", error: error.message });
  }
};
