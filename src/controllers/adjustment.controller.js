// src/controllers/adjustment.controller.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const toNumber = (val) => {
  if (val == null) return 0;
  if (typeof val === 'object' && typeof val.toNumber === 'function') {
    return val.toNumber();
  }
  return Number(val);
};

// ✅ Create Adjustment (with adjustment_items)
export const createAdjustment = async (req, res) => {
  try {
    const {
      company_id,
      voucher_no,
      manual_voucher_no,
      adjustment_type,
      adjustment_date,
      notes,
      adjustment_items = [],
    } = req.body;

    if (!company_id || !voucher_no || !adjustment_type || !adjustment_date) {
      return res.status(400).json({
        success: false,
        message: "company_id, voucher_no, adjustment_type, and adjustment_date are required",
      });
    }

    // Validate adjustment_type enum
    const validTypes = ["add", "remove", "adjust"];
    if (!validTypes.includes(adjustment_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid adjustment_type. Must be 'add', 'remove', or 'adjust'",
      });
    }

    const newAdjustment = await prisma.$transaction(async (tx) => {
      const adjustment = await tx.adjustments.create({
        data: {
          company_id: toNumber(company_id),
          voucher_no,
          manual_voucher_no,
          adjustment_type,
          adjustment_date: new Date(adjustment_date),
          notes,
        },
      });

      if (Array.isArray(adjustment_items) && adjustment_items.length > 0) {
        const itemsData = adjustment_items.map((item) => ({
          adjustment_id: adjustment.id,
          product_id: toNumber(item.product_id),
          warehouse_id: toNumber(item.warehouse_id),
          quantity: parseFloat(item.quantity),
          rate: item.rate ? parseFloat(item.rate) : 0.0,
          narration: item.narration || null,
        }));

        await tx.adjustment_items.createMany({
          data: itemsData,
        });
      }

      return adjustment;
    });

    return res.status(201).json({
      success: true,
      message: "Adjustment created successfully",
      data: { id: newAdjustment.id },
    });
  } catch (error) {
    console.error("Error creating adjustment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create adjustment",
      error: error.message,
    });
  }
};

// ✅ Get All Adjustments (with items and company name)
export const getAllAdjustments = async (req, res) => {
  try {
    const adjustments = await prisma.adjustments.findMany({
      include: {
        adjustment_items: true,
        companies: {
          select: { name: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const formatted = adjustments.map(adj => ({
      ...adj,
      id: toNumber(adj.id),
      company_id: toNumber(adj.company_id),
      company_name: adj.companies?.name || null,
      adjustment_items: adj.adjustment_items.map(item => ({
        ...item,
        id: toNumber(item.id),
        adjustment_id: toNumber(item.adjustment_id),
        product_id: toNumber(item.product_id),
        warehouse_id: toNumber(item.warehouse_id),
        quantity: parseFloat(item.quantity),
        rate: item.rate ? parseFloat(item.rate) : 0.0,
      })),
    }));

    return res.status(200).json({
      success: true,
      message: "Adjustments fetched successfully",
      data: formatted,
    });
  } catch (error) {
    console.error("Error fetching adjustments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch adjustments",
      error: error.message,
    });
  }
};

// ✅ Get Adjustment By ID
export const getAdjustmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const adjId = toNumber(id);

    const adjustment = await prisma.adjustments.findUnique({
      where: { id: adjId },
      include: {
        adjustment_items: true,
        companies: {
          select: { name: true },
        },
      },
    });

    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: "Adjustment not found",
      });
    }

    const formatted = {
      ...adjustment,
      id: toNumber(adjustment.id),
      company_id: toNumber(adjustment.company_id),
      company_name: adjustment.companies?.name || null,
      adjustment_items: adjustment.adjustment_items.map(item => ({
        ...item,
        id: toNumber(item.id),
        adjustment_id: toNumber(item.adjustment_id),
        product_id: toNumber(item.product_id),
        warehouse_id: toNumber(item.warehouse_id),
        quantity: parseFloat(item.quantity),
        rate: item.rate ? parseFloat(item.rate) : 0.0,
      })),
    };

    return res.status(200).json({
      success: true,
      message: "Adjustment fetched successfully",
      data: formatted,
    });
  } catch (error) {
    console.error("Error fetching adjustment by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch adjustment",
      error: error.message,
    });
  }
};

// ✅ Update Adjustment (and replace adjustment_items)
export const updateAdjustment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company_id,
      voucher_no,
      manual_voucher_no,
      adjustment_type,
      adjustment_date,
      notes,
      adjustment_items = [],
    } = req.body;

    const adjId = toNumber(id);

    const existing = await prisma.adjustments.findUnique({ where: { id: adjId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Adjustment not found" });
    }

    const validTypes = ["add", "remove", "adjust"];
    if (adjustment_type && !validTypes.includes(adjustment_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid adjustment_type",
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Update adjustment
      await tx.adjustments.update({
        where: { id: adjId },
        data: {
          ...(company_id !== undefined && { company_id: toNumber(company_id) }),
          ...(voucher_no !== undefined && { voucher_no }),
          ...(manual_voucher_no !== undefined && { manual_voucher_no }),
          ...(adjustment_type !== undefined && { adjustment_type }),
          ...(adjustment_date !== undefined && { adjustment_date: new Date(adjustment_date) }),
          ...(notes !== undefined && { notes }),
        },
      });

      // Replace all items
      await tx.adjustment_items.deleteMany({ where: { adjustment_id: adjId } });

      if (Array.isArray(adjustment_items) && adjustment_items.length > 0) {
        const itemsData = adjustment_items.map((item) => ({
          adjustment_id: adjId,
          product_id: toNumber(item.product_id),
          warehouse_id: toNumber(item.warehouse_id),
          quantity: parseFloat(item.quantity),
          rate: item.rate ? parseFloat(item.rate) : 0.0,
          narration: item.narration || null,
        }));

        await tx.adjustment_items.createMany({ data: itemsData });
      }

      return await tx.adjustments.findUnique({
        where: { id: adjId },
        include: { adjustment_items: true },
      });
    });

    return res.status(200).json({
      success: true,
      message: "Adjustment updated successfully",
      data: { id: updated.id },
    });
  } catch (error) {
    console.error("Error updating adjustment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update adjustment",
      error: error.message,
    });
  }
};

// ✅ Delete Adjustment (and its items)
export const deleteAdjustment = async (req, res) => {
  try {
    const { id } = req.params;
    const adjId = toNumber(id);

    const existing = await prisma.adjustments.findUnique({ where: { id: adjId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Adjustment not found" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.adjustment_items.deleteMany({ where: { adjustment_id: adjId } });
      await tx.adjustments.delete({ where: { id: adjId } });
    });

    return res.status(200).json({
      success: true,
      message: "Adjustment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting adjustment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete adjustment",
      error: error.message,
    });
  }
};