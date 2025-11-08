// src/controllers/ewayBillController.js
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

// ✅ Create e-Way Bill
export const createEwayBill = async (req, res) => {
  try {
    const {
      bill_no,
      bill_date,
      from_location,
      to_location,
      value,
      valid_until,
      status,
      company_id,
    } = req.body;

    if (!company_id || !bill_no) {
      return res.status(400).json({
        success: false,
        message: "company_id and bill_no are required",
      });
    }

    const newEwayBill = await prisma.ewaybills.create({
      data: {
        company_id: parseInt(company_id),
        bill_no,
        bill_date: new Date(bill_date),
        from_location,
        to_location,
        value: toNumber(value),
        valid_until: new Date(valid_until),
        status: status || "Active",
      },
    });

    return res.status(201).json({
      success: true,
      message: "e-Way Bill created successfully",
      data: { id: newEwayBill.id },
    });
  } catch (error) {
    console.error("Error creating e-Way Bill:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create e-Way Bill",
      error: error.message,
    });
  }
};

// ✅ Get all e-Way Bills for a company
export const getEwayBillsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    const bills = await prisma.ewaybills.findMany({
      where: {
        company_id: parseInt(companyId),
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const formattedBills = bills.map((bill) => ({
      ...bill,
      id: toNumber(bill.id),
      company_id: toNumber(bill.company_id),
      value: toNumber(bill.value),
      bill_date: bill.bill_date ? bill.bill_date.toISOString() : null,
      valid_until: bill.valid_until ? bill.valid_until.toISOString() : null,
      created_at: bill.created_at ? bill.created_at.toISOString() : null,
    }));

    return res.status(200).json({
      success: true,
      message: "e-Way Bills fetched successfully",
      data: formattedBills,
    });
  } catch (error) {
    console.error("Error fetching e-Way Bills by company:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch e-Way Bills",
      error: error.message,
    });
  }
};

// ✅ Get single e-Way Bill by ID
export const getEwayBillById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "e-Way Bill ID is required",
      });
    }

    const bill = await prisma.ewaybills.findUnique({
      where: { id: parseInt(id) },
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "e-Way Bill not found",
      });
    }

    const formattedBill = {
      ...bill,
      id: toNumber(bill.id),
      company_id: toNumber(bill.company_id),
      value: toNumber(bill.value),
      bill_date: bill.bill_date ? bill.bill_date.toISOString() : null,
      valid_until: bill.valid_until ? bill.valid_until.toISOString() : null,
      created_at: bill.created_at ? bill.created_at.toISOString() : null,
    };

    return res.status(200).json({
      success: true,
      message: "e-Way Bill fetched successfully",
      data: formattedBill,
    });
  } catch (error) {
    console.error("Error fetching e-Way Bill by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch e-Way Bill",
      error: error.message,
    });
  }
};

// ✅ Update e-Way Bill
export const updateEwayBill = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "e-Way Bill ID is required",
      });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
      });
    }

    const billId = parseInt(id);
    const existingBill = await prisma.ewaybills.findUnique({
      where: { id: billId },
    });

    if (!existingBill) {
      return res.status(404).json({
        success: false,
        message: "e-Way Bill not found",
      });
    }

    // Prepare update data with type safety
    const updateData = {};
    if ("bill_no" in updates) updateData.bill_no = updates.bill_no;
    if ("from_location" in updates) updateData.from_location = updates.from_location;
    if ("to_location" in updates) updateData.to_location = updates.to_location;
    if ("status" in updates) updateData.status = updates.status;
    if ("value" in updates) updateData.value = toNumber(updates.value);
    if ("bill_date" in updates) updateData.bill_date = new Date(updates.bill_date);
    if ("valid_until" in updates) updateData.valid_until = new Date(updates.valid_until);
    if ("company_id" in updates) updateData.company_id = parseInt(updates.company_id);

    const updatedBill = await prisma.ewaybills.update({
      where: { id: billId },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: "e-Way Bill updated successfully",
      data: { id: toNumber(updatedBill.id) },
    });
  } catch (error) {
    console.error("Error updating e-Way Bill:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update e-Way Bill",
      error: error.message,
    });
  }
};

// ✅ Delete e-Way Bill
export const deleteEwayBill = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "e-Way Bill ID is required",
      });
    }

    const billId = parseInt(id);
    const existingBill = await prisma.ewaybills.findUnique({
      where: { id: billId },
    });

    if (!existingBill) {
      return res.status(404).json({
        success: false,
        message: "e-Way Bill not found",
      });
    }

    await prisma.ewaybills.delete({
      where: { id: billId },
    });

    return res.status(200).json({
      success: true,
      message: "e-Way Bill deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting e-Way Bill:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete e-Way Bill",
      error: error.message,
    });
  }
};