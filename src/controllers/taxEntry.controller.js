

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// 🔹 Create Tax Entry
export const createTaxEntry = async (req, res) => {
  try {
    const {
      company_id,
      type,
      party,
      pan,
      amount,
      rate,
      tax_amount,
      entry_date,
    } = req.body;

    if (
      !company_id ||
      !type ||
      !party ||
      !pan ||
      !amount ||
      !rate ||
      !tax_amount ||
      !entry_date
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const entry = await prisma.tax_entries.create({
      data: {
        company_id: Number(company_id),
        type,
        party,
        pan,
        amount: parseFloat(amount),
        rate: parseFloat(rate),
        tax_amount: parseFloat(tax_amount),
        entry_date: new Date(entry_date),
      },
    });

    res.json({
      success: true,
      message: "Tax entry created successfully",
      entry_id: entry.id,
    });
  } catch (error) {
    console.error("Create Tax Entry Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create tax entry",
      error: error.message,
    });
  }
};

// 🔹 Get Tax Entries by Company ID
export const getTaxEntriesByCompany = async (req, res) => {
  try {
    const { company_id } = req.params;

    if (!company_id) {
      return res
        .status(400)
        .json({ success: false, message: "Company ID is required" });
    }

    const entries = await prisma.tax_entries.findMany({
      where: { company_id: Number(company_id) },
      orderBy: { entry_date: "desc" },
    });

    res.json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    console.error("Get Tax Entries Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tax entries",
      error: error.message,
    });
  }
};

// 🔹 Update Tax Entry (partial update allowed)
export const updateTaxEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Entry ID is required" });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No fields provided for update" });
    }

    const validFields = [
      "type",
      "party",
      "pan",
      "amount",
      "rate",
      "tax_amount",
      "entry_date",
    ];

    const data = {};
    for (const key of validFields) {
      if (key in updates) {
        data[key] =
          key === "amount" ||
          key === "rate" ||
          key === "tax_amount"
            ? parseFloat(updates[key])
            : key === "entry_date"
            ? new Date(updates[key])
            : updates[key];
      }
    }

    if (Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No valid fields provided" });
    }

    data.updated_at = new Date();

    const updated = await prisma.tax_entries.update({
      where: { id: Number(id) },
      data,
    });

    res.json({
      success: true,
      message: "Tax entry updated successfully",
      entry_id: updated.id,
    });
  } catch (error) {
    console.error("Update Tax Entry Error:", error);
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Tax entry not found" });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update tax entry",
      error: error.message,
    });
  }
};

// 🔹 Delete Tax Entry
export const deleteTaxEntry = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Entry ID is required" });
    }

    await prisma.tax_entries.delete({
      where: { id: Number(id) },
    });

    res.json({
      success: true,
      message: "Tax entry deleted successfully",
      entry_id: Number(id),
    });
  } catch (error) {
    console.error("Delete Tax Entry Error:", error);
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Tax entry not found" });
    }
    res.status(500).json({
      success: false,
      message: "Failed to delete tax entry",
      error: error.message,
    });
  }
};
