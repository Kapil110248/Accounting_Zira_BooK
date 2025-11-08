

// Utility: Convert Decimal/BigInt to number safely
// const toNumber = (val) => {
//   if (val == null) return 0;
//   if (typeof val === "object" && typeof val.toNumber === "function") {
//     return val.toNumber();
//   }
//   return Number(val);
// };

import { Prisma } from "@prisma/client";
import prisma from "../config/db.js";

// // ✅ Create Adjustment
// export const createAdjustment = async (req, res) => {
//   try {
//     const {
//       company_id,
//       voucher_no,
//       manual_voucher_no,
//       adjustment_type, // 'add', 'remove', or 'adjust'
//       adjustment_date,
//       notes,
//       adjustment_items = [], // array of items
//     } = req.body;

//     console.log("Received createAdjustment request:", req.body);

//     // Validation
//     if (!company_id || !voucher_no || !adjustment_type || !adjustment_date) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Missing required fields: company_id, voucher_no, adjustment_type, adjustment_date",
//       });
//     }

//     // Validate adjustment_type
//     const validTypes = ["add", "remove", "adjust"];
//     if (!validTypes.includes(adjustment_type)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid adjustment_type. Must be 'add', 'remove', or 'adjust'",
//       });
//     }

//     // ✅ Transaction: Create adjustment + items
//     const newAdjustment = await prisma.$transaction(async (tx) => {
//       // Create main adjustment
//       const adjustment = await tx.adjustments.create({
//         data: {
//           company_id: parseInt(company_id),
//           voucher_no,
//           manual_voucher_no,
//           adjustment_type,
//           adjustment_date: new Date(adjustment_date),
//           notes,
//         },
//       });

//       // Create adjustment items
//       if (Array.isArray(adjustment_items) && adjustment_items.length > 0) {
//         const itemsData = adjustment_items.map((item) => ({
//           adjustment_id: adjustment.id,
//           product_id: parseInt(item.product_id),
//           warehouse_id: parseInt(item.warehouse_id),
//           quantity: toNumber(item.quantity),
//           rate: item.rate != null ? toNumber(item.rate) : 0,
//           narration: item.narration || null,
//         }));

//         await tx.adjustment_items.createMany({
//           data: itemsData,
//         });
//       }

//       return adjustment;
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Adjustment created successfully",
//       data: { id: newAdjustment.id },
//     });
//   } catch (error) {
//     console.error("❌ Error creating adjustment:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to create adjustment",
//       error: error?.message || String(error) || "Unknown error",
//     });
//   }
// };

const toNumber = (val) => {
  if (val == null) return 0;
  if (typeof val === "object" && typeof val.toNumber === "function") {
    return val.toNumber();
  }
  return Number(val);
};

// ✅ Create Adjustment
export const createAdjustment = async (req, res) => {
  try {
    const {
      company_id,
      voucher_no,
      manual_voucher_no,
      adjustment_type, // 'add', 'remove', or 'adjust'
      voucher_date,
      notes,
      total_value,
      adjustment_items = [], // array of items
    } = req.body;

    console.log("🟢 Received createAdjustment request:", req.body);

    // 🧩 Validation
    if (!company_id || !voucher_no || !adjustment_type || !voucher_date) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: company_id, voucher_no, adjustment_type, voucher_date",
      });
    }

    // 🧩 Validate adjustment_type
    const validTypes = ["add", "remove", "adjust"];
    if (!validTypes.includes(adjustment_type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid adjustment_type. Must be 'add', 'remove', or 'adjust'",
      });
    }

    // 🧩 Parse items (if sent as string)
    let parsedItems = [];
    if (typeof adjustment_items === "string") {
      parsedItems = JSON.parse(adjustment_items);
    } else if (Array.isArray(adjustment_items)) {
      parsedItems = adjustment_items;
    }

    // 🧮 Calculate total value if not provided
    const computedTotal =
      total_value ||
      parsedItems.reduce(
        (sum, item) => sum + toNumber(item.quantity) * toNumber(item.rate),
        0
      );

    // 🧾 Transaction — create adjustment + items
    const newAdjustment = await prisma.$transaction(async (tx) => {
      // Create main adjustment
      const adjustment = await tx.adjustments.create({
        data: {
          company_id: Number(company_id),
          voucher_no,
          manual_voucher_no: manual_voucher_no || null,
          adjustment_type: adjustment_type.toLowerCase(),
          voucher_date: new Date(voucher_date),
          notes: notes || null,
          total_value: new Prisma.Decimal(computedTotal),
        },
      });

      // Create related items
      if (parsedItems.length > 0) {
        const itemsData = parsedItems.map((item) => ({
          adjustment_id: adjustment.id,
          product_id: Number(item.product_id),
          warehouse_id: Number(item.warehouse_id),
          quantity: new Prisma.Decimal(toNumber(item.quantity)),
          rate: new Prisma.Decimal(toNumber(item.rate || 0)),
          narration: item.narration || null,
        }));

        await tx.adjustment_items.createMany({ data: itemsData });
      }

      return adjustment;
    });

    // ✅ Success
    return res.status(201).json({
      success: true,
      message: "Adjustment created successfully",
      data: newAdjustment,
    });
  } catch (error) {
    console.error("❌ Error creating adjustment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create adjustment",
      error: error?.message || String(error),
    });
  }
};

// ✅ Get All Adjustments (without product/warehouse includes)
// export const getAllAdjustments = async (req, res) => {
//   try {
//     const adjustments = await prisma.adjustments.findMany({
//       include: {
//         adjustment_items: {
//           // ✅ Removed product and warehouse includes
//           // Only fetch basic adjustment_items data
//         },
//         companies: { select: { name: true } }, // assuming company_name exists
//       },
//       orderBy: { created_at: "desc" },
//     });

//     const formatted = adjustments.map((adj) => ({
//       ...adj,
//       id: toNumber(adj.id),
//       company_id: toNumber(adj.company_id),
//       adjustment_items: adj.adjustment_items.map((item) => ({
//         ...item,
//         id: toNumber(item.id),
//         product_id: toNumber(item.product_id),
//         warehouse_id: toNumber(item.warehouse_id),
//         quantity: toNumber(item.quantity),
//         rate: toNumber(item.rate),
//       })),
//     }));

//     return res.status(200).json({
//       success: true,
//       message: "Adjustments fetched successfully",
//       data: formatted,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching all adjustments:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch adjustments",
//       error: error?.message || String(error) || "Unknown error",
//     });
//   }
// };

export const getAllAdjustments = async (req, res) => {
  try {
    const adjustments = await prisma.adjustments.findMany({
      include: {
        adjustment_items: true, // Include all items related to this adjustment
      },
      orderBy: {
        adjustment_date: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Adjustments fetched successfully",
      data: adjustments,
    });
  } catch (error) {
    console.error("❌ Error fetching adjustments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch adjustments",
      error: error?.message || String(error) || "Unknown error",
    });
  }
};


// ✅ Get Adjustment By ID (without product/warehouse includes)
export const getAdjustmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const adjustmentId = parseInt(id);

    if (isNaN(adjustmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid adjustment ID",
      });
    }

    const adjustment = await prisma.adjustments.findUnique({
      where: { id: adjustmentId },
      include: {
        adjustment_items: {
          // ✅ Removed product and warehouse includes
        },
        companies: { select: { company: true } },
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
      adjustment_items: adjustment.adjustment_items.map((item) => ({
        ...item,
        id: toNumber(item.id),
        product_id: toNumber(item.product_id),
        warehouse_id: toNumber(item.warehouse_id),
        quantity: toNumber(item.quantity),
        rate: toNumber(item.rate),
      })),
    };

    return res.status(200).json({
      success: true,
      message: "Adjustment fetched successfully",
      data: formatted,
    });
  } catch (error) {
    console.error("❌ Error fetching adjustment by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch adjustment",
      error: error?.message || String(error) || "Unknown error",
    });
  }
};

// ✅ Get Adjustments by Company ID (without product/warehouse includes)
export const getAdjustmentsByCompanyId = async (req, res) => {
  try {
    const { companyId } = req.params;
    const companyIdNum = parseInt(companyId);

    if (isNaN(companyIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid company ID",
      });
    }

    const adjustments = await prisma.adjustments.findMany({
      where: { company_id: companyIdNum },
      include: {
        adjustment_items: {
          // ✅ Removed product and warehouse includes
        },
        companies: { select: { name: true } },
      },
      orderBy: { created_at: "desc" },
    });

    const formatted = adjustments.map((adj) => ({
      ...adj,
      id: toNumber(adj.id),
      company_id: toNumber(adj.company_id),
      adjustment_items: adj.adjustment_items.map((item) => ({
        ...item,
        id: toNumber(item.id),
        product_id: toNumber(item.product_id),
        warehouse_id: toNumber(item.warehouse_id),
        quantity: toNumber(item.quantity),
        rate: toNumber(item.rate),
      })),
    }));

    return res.status(200).json({
      success: true,
      message: "Adjustments fetched successfully",
      data: formatted,
    });
  } catch (error) {
    console.error("❌ Error fetching adjustments by company:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch adjustments",
      error: error?.message || String(error) || "Unknown error",
    });
  }
};

// ✅ Update Adjustment (basic version)
// export const updateAdjustment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { notes, adjustment_type, adjustment_date } = req.body;

//     const adjustmentId = parseInt(id);
//     if (isNaN(adjustmentId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid adjustment ID",
//       });
//     }

//     // Validate adjustment_type if provided
//     if (adjustment_type) {
//       const validTypes = ["add", "remove", "adjust"];
//       if (!validTypes.includes(adjustment_type)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid adjustment_type. Must be 'add', 'remove', or 'adjust'",
//         });
//       }
//     }

//     const updated = await prisma.adjustments.update({
//       where: { id: adjustmentId },
//       data: {
//         ...(notes !== undefined && { notes }),
//         ...(adjustment_type !== undefined && { adjustment_type }),
//         ...(adjustment_date !== undefined && { adjustment_date: new Date(adjustment_date) }),
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Adjustment updated successfully",
//       data: { id: updated.id }, // ✅ Only return ID to avoid circular reference
//     });
//   } catch (error) {
//     console.error("❌ Error updating adjustment:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update adjustment",
//       error: error?.message || String(error) || "Unknown error",
//     });
//   }
// };

export const updateAdjustment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      voucher_no,
      manual_voucher_no,
      adjustment_type,
      voucher_date,
      notes,
      total_value,
      adjustment_items,
    } = req.body;

    // 🧩 Check existence
    const existing = await prisma.adjustments.findUnique({
      where: { id: Number(id) },
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Adjustment not found" });
    }

    // 🧾 Parse items safely
    let parsedItems = [];
    if (adjustment_items) {
      parsedItems =
        typeof adjustment_items === "string"
          ? JSON.parse(adjustment_items)
          : adjustment_items;
    }

    // 🧮 Transaction: update main + replace items
    const updatedAdjustment = await prisma.$transaction(async (tx) => {
      const updated = await tx.adjustments.update({
        where: { id: Number(id) },
        data: {
          ...(voucher_no && { voucher_no }),
          ...(manual_voucher_no && { manual_voucher_no }),
          ...(adjustment_type && { adjustment_type: adjustment_type.toLowerCase() }),
          ...(voucher_date && { voucher_date: new Date(voucher_date) }),
          ...(notes && { notes }),
          ...(total_value && { total_value: new Prisma.Decimal(total_value) }),
        },
      });

      // 🔁 Replace items if provided
      if (parsedItems.length > 0) {
        await tx.adjustment_items.deleteMany({ where: { adjustment_id: Number(id) } });

        const itemsData = parsedItems.map((item) => ({
          adjustment_id: Number(id),
          product_id: Number(item.product_id),
          warehouse_id: Number(item.warehouse_id),
          quantity: new Prisma.Decimal(toNumber(item.quantity)),
          rate: new Prisma.Decimal(toNumber(item.rate || 0)),
          narration: item.narration || null,
        }));

        await tx.adjustment_items.createMany({ data: itemsData });
      }

      return updated;
    });

    res.json({
      success: true,
      message: "Adjustment updated successfully",
      data: updatedAdjustment,
    });
  } catch (error) {
    console.error("❌ Update Adjustment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete Adjustment (cascade delete items)
// export const deleteAdjustment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const adjustmentId = parseInt(id);

//     if (isNaN(adjustmentId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid adjustment ID",
//       });
//     }

//     const existing = await prisma.adjustments.findUnique({
//       where: { id: adjustmentId },
//     });

//     if (!existing) {
//       return res.status(404).json({
//         success: false,
//         message: "Adjustment not found",
//       });
//     }

//     await prisma.adjustments.delete({
//       where: { id: adjustmentId },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Adjustment deleted successfully",
//     });
//   } catch (error) {
//     console.error("❌ Error deleting adjustment:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to delete adjustment",
//       error: error?.message || String(error) || "Unknown error",
//     });
//   }
// };

export const deleteAdjustment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check existence
    const existing = await prisma.adjustments.findUnique({
      where: { id: Number(id) },
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Adjustment not found" });
    }

    // Transaction — delete related items + adjustment
    await prisma.$transaction(async (tx) => {
      await tx.adjustment_items.deleteMany({ where: { adjustment_id: Number(id) } });
      await tx.adjustments.delete({ where: { id: Number(id) } });
    });

    res.json({
      success: true,
      message: "Adjustment deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Adjustment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
