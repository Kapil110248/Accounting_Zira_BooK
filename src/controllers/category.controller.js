// src/controllers/category.controller.js

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ✅ Create Category
export const createCategory = async (req, res) => {
  try {
    const { name, company_id } = req.body;

    if (!name || !company_id) {
      return res.status(400).json({ success: false, message: "Category name and company_id are required" });
    }

    const newCategory = await prisma.categories.create({
      data: {
        name,
        company_id: parseInt(company_id),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: { id: newCategory.id },
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
    });
  }
};

// ✅ Get All Categories (including subgroups)
export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.categories.findMany({
      where: { deleted_at: { equals: null } },
      include: { subgroups: true },
      orderBy: { id: "desc" },
    });

    return res.status(200).json({
      success: true,
      message: "All categories retrieved",
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

// ✅ Get Categories by Company ID
export const getCategoriesByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const company_id = parseInt(companyId);

    if (isNaN(company_id)) {
      return res.status(400).json({ success: false, message: "Invalid company ID" });
    }

    const categories = await prisma.categories.findMany({
      where: { company_id, deleted_at: null },
      include: { subgroups: true },
      orderBy: { id: "desc" },
    });

    return res.status(200).json({
      success: true,
      message: "Categories retrieved by company",
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories by company:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

// ✅ Update Category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, company_id } = req.body;

    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    const existing = await prisma.categories.findUnique({ where: { id: categoryId } });
    if (!existing || existing.deleted_at) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const updated = await prisma.categories.update({
      where: { id: categoryId },
      data: {
        name: name || existing.name,
        company_id: company_id ? parseInt(company_id) : existing.company_id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: { id: updated.id },
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};

// ✅ Soft Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    const existing = await prisma.categories.findUnique({ where: { id: categoryId } });
    if (!existing || existing.deleted_at) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    await prisma.categories.update({
      where: { id: categoryId },
      data: { deleted_at: new Date() },
    });

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
};
