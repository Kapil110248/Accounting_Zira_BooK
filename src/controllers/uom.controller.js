import prisma from "../config/db.js";


// Utility: Convert to number safely (for Decimal/BigInt)
const toNumber = (val) => {
  if (val == null) return 0;
  if (typeof val === 'object' && typeof val.toNumber === 'function') {
    return val.toNumber();
  }
  return Number(val);
};

// ✅ Create UOM
export const createUOM = async (req, res) => {
  try {
    const { company_id, unit_name } = req.body;

    if (!company_id || !unit_name) {
      return res.status(400).json({
        success: false,
        message: "Company ID and Unit Name are required",
      });
    }

    const newUOM = await prisma.uoms.create({
      data: {
        company_id: toNumber(company_id),
        unit_name,
      },
    });

    return res.status(201).json({
      success: true,
      message: "UOM created successfully",
      data: {
        id: toNumber(newUOM.id),
        company_id: toNumber(newUOM.company_id),
        unit_name: newUOM.unit_name,
        created_at: newUOM.created_at,
      },
    });
  } catch (error) {
    console.error("Error creating UOM:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create UOM",
      error: error.message,
    });
  }
};

// ✅ Get All UOMs

export const getAllUOMs = async (req, res) => {
  try {
    const { company_id } = req.query; // Get company_id from query

    // ✅ Optional filter
    const where = company_id ? { company_id: parseInt(company_id) } : {};

    const uoms = await prisma.uoms.findMany({
      where,
      orderBy: { id: 'desc' },
    });

    const formattedUOMs = uoms.map(uom => ({
      id: toNumber(uom.id),
      company_id: toNumber(uom.company_id),
      unit_name: uom.unit_name,
      created_at: uom.created_at,
    }));

    return res.status(200).json({
      success: true,
      message: company_id
        ? `UOMs for company_id ${company_id} retrieved successfully`
        : "All UOMs retrieved successfully",
      data: formattedUOMs,
    });
  } catch (error) {
    console.error("Error fetching UOMs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch UOMs",
      error: error.message,
    });
  }
};

// ✅ Get UOM By ID
export const getUOMById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "UOM ID is required" });
    }

    const uomId = parseInt(id);

    const uom = await prisma.uoms.findUnique({
      where: { id: uomId },
    });

    if (!uom) {
      return res.status(404).json({ success: false, message: "UOM not found" });
    }

    return res.status(200).json({
      success: true,
      message: "UOM fetched successfully",
      data: {
        id: toNumber(uom.id),
        company_id: toNumber(uom.company_id),
        unit_name: uom.unit_name,
        created_at: uom.created_at,
      },
    });
  } catch (error) {
    console.error("Error fetching UOM by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch UOM",
      error: error.message,
    });
  }
};    

// ✅ Update UOM
export const updateUOM = async (req, res) => {
  try {
    const { id } = req.params;
    const { company_id, unit_name } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "UOM ID is required" });
    }

    const uomId = parseInt(id);

    const existingUOM = await prisma.uoms.findUnique({ where: { id: uomId } });
    if (!existingUOM) {
      return res.status(404).json({ success: false, message: "UOM not found" });
    }

    const updatedUOM = await prisma.uoms.update({
      where: { id: uomId },
      data: {
        company_id: company_id !== undefined ? toNumber(company_id) : undefined,
        unit_name: unit_name !== undefined ? unit_name : undefined,
      },
    });

    return res.status(200).json({
      success: true,
      message: "UOM updated successfully",
      data: {
        id: toNumber(updatedUOM.id),
        company_id: toNumber(updatedUOM.company_id),
        unit_name: updatedUOM.unit_name,
        created_at: updatedUOM.created_at,
      },
    });
  } catch (error) {
    console.error("Error updating UOM:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update UOM",
      error: error.message,
    });
  }
};

// ✅ Delete UOM
export const deleteUOM = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "UOM ID is required" });
    }

    const uomId = parseInt(id);

    const uom = await prisma.uoms.findUnique({ where: { id: uomId } });
    if (!uom) {
      return res.status(404).json({ success: false, message: "UOM not found" });
    }

    await prisma.uoms.delete({
      where: { id: uomId },
    });

    return res.status(200).json({
      success: true,
      message: "UOM deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting UOM:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete UOM",
      error: error.message,
    });
  }
};