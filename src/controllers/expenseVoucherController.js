// src/controllers/expenseVoucherController.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Utility: Convert Decimal/BigInt to number safely
const toNumber = (val) => {
  if (val == null) return 0;
  if (typeof val === "object" && typeof val.toNumber === "function") {
    return val.toNumber();
  }
  return Number(val);
};

// ✅ CREATE Expense Voucher
export const createExpenseVoucher = async (req, res) => {
  const {
    company_id,
    auto_receipt_no,
    manual_receipt_no,
    voucher_date,
    paid_from_account_id,
    narration,
    items = [],
  } = req.body;

  try {
    // Validate required fields
    if (!company_id || !auto_receipt_no || !paid_from_account_id) {
      return res.status(400).json({
        status: false,
        message: "Missing required fields: company_id, auto_receipt_no, paid_from_account_id",
      });
    }

    const voucher = await prisma.$transaction(async (tx) => {
      const totalAmount = items.reduce(
        (sum, item) => sum + toNumber(item.amount || 0),
        0
      );

      const createdVoucher = await tx.expensevouchers.create({
        data: {
          company_id: Number(company_id),
          auto_receipt_no,
          manual_receipt_no,
          voucher_date: new Date(voucher_date),
          paid_from_account_id: Number(paid_from_account_id),
          narration,
          total_amount: totalAmount,
          expensevoucher_items: {
            create: items.map((item) => ({
              account_name: item.account_name,
              vendor_id: item.vendor_id ? Number(item.vendor_id) : null,
              amount: toNumber(item.amount || 0),
              narration: item.narration || null,
            })),
          },
        },
        include: {
          expensevoucher_items: true,
        },
      });

      return createdVoucher;
    });

    return res.status(201).json({
      status: true,
      message: "Expense Voucher created successfully",
      data: {
        id: voucher.id,
        company_id: voucher.company_id,
        auto_receipt_no: voucher.auto_receipt_no,
        manual_receipt_no: voucher.manual_receipt_no,
        voucher_date: voucher.voucher_date,
        paid_from_account_id: voucher.paid_from_account_id,
        narration: voucher.narration,
        total_amount: toNumber(voucher.total_amount),
        expensevoucher_items: voucher.expensevoucher_items.map((item) => ({
          id: item.id,
          account_name: item.account_name,
          vendor_id: item.vendor_id,
          amount: toNumber(item.amount),
          narration: item.narration,
        })),
      },
    });
  } catch (error) {
    console.error("❌ Create Expense Voucher Error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to create expense voucher",
      error: error.message,
    });
  }
};

// ✅ GET Expense Voucher by ID
export const getExpenseVoucherById = async (req, res) => {
  try {
    const { id } = req.params;
    const voucherId = Number(id);

    if (isNaN(voucherId)) {
      return res.status(400).json({ status: false, message: "Invalid voucher ID" });
    }

    const voucher = await prisma.expensevouchers.findUnique({
      where: { id: voucherId },
      include: { expensevoucher_items: true },
    });

    if (!voucher) {
      return res.status(404).json({ status: false, message: "Expense Voucher not found" });
    }

    return res.json({
      status: true,
      data: {
        ...voucher,
        total_amount: toNumber(voucher.total_amount),
        expensevoucher_items: voucher.expensevoucher_items.map((item) => ({
          ...item,
          amount: toNumber(item.amount),
        })),
      },
    });
  } catch (error) {
    console.error("❌ Get Expense Voucher Error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch expense voucher",
      error: error.message,
    });
  }
};

// ✅ GET Expense Vouchers by Company ID
export const getExpenseVouchersByCompanyId = async (req, res) => {
  try {
   
 const { companyId } = req.params;
    const companyIdNum = Number(companyId);

    if (isNaN(companyIdNum)) {
      return res.status(400).json({ status: false, message: "Invalid company ID" });
    }

    const vouchers = await prisma.expensevouchers.findMany({
      where: { company_id: companyIdNum },
      include: { expensevoucher_items: true },
      orderBy: { created_at: "desc" },
    });

    const formattedVouchers = vouchers.map((v) => ({
      ...v,
      total_amount: toNumber(v.total_amount),
      expensevoucher_items: v.expensevoucher_items.map((item) => ({
        ...item,
        amount: toNumber(item.amount),
      })),
    }));

    return res.json({
      status: true,
      data: formattedVouchers,
    });
  } catch (error) {
    console.error("❌ Get Expense Vouchers by Company Error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch company expense vouchers",
      error: error.message,
    });
  }
};

// ✅ UPDATE Expense Voucher
export const updateExpenseVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, ...fields } = req.body;
    const voucherId = Number(id);

    if (isNaN(voucherId)) {
      return res.status(400).json({ status: false, message: "Invalid voucher ID" });
    }

    const existing = await prisma.expensevouchers.findUnique({
      where: { id: voucherId },
    });

    if (!existing) {
      return res.status(404).json({ status: false, message: "Expense Voucher not found" });
    }

    await prisma.$transaction(async (tx) => {
      // Update main voucher fields
      const updateData = {};
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined && value !== null) {
          if (key === "voucher_date") {
            updateData[key] = new Date(value);
          } else if (["company_id", "paid_from_account_id"].includes(key)) {
            updateData[key] = Number(value);
          } else {
            updateData[key] = value;
          }
        }
      }

      if (Object.keys(updateData).length > 0) {
        await tx.expensevouchers.update({
          where: { id: voucherId },
          data: updateData,
        });
      }

      // Update items if provided
      if (items && Array.isArray(items)) {
        await tx.expensevoucher_items.deleteMany({
          where: { voucher_id: voucherId },
        });

        const totalAmount = items.reduce(
          (sum, item) => sum + toNumber(item.amount || 0),
          0
        );

        await tx.expensevoucher_items.createMany({
          data: items.map((item) => ({
            voucher_id: voucherId,
            account_name: item.account_name,
            vendor_id: item.vendor_id ? Number(item.vendor_id) : null,
            amount: toNumber(item.amount || 0),
            narration: item.narration || null,
          })),
        });

        await tx.expensevouchers.update({
          where: { id: voucherId },
          data: { total_amount: totalAmount },
        });
      }
    });

    return res.json({
      status: true,
      message: "Expense Voucher updated successfully",
    });
  } catch (error) {
    console.error("❌ Update Expense Voucher Error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to update expense voucher",
      error: error.message,
    });
  }
};

// ✅ DELETE Expense Voucher
export const deleteExpenseVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const voucherId = Number(id);

    if (isNaN(voucherId)) {
      return res.status(400).json({ status: false, message: "Invalid voucher ID" });
    }

    const existing = await prisma.expensevouchers.findUnique({
      where: { id: voucherId },
    });

    if (!existing) {
      return res.status(404).json({ status: false, message: "Expense Voucher not found" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.expensevoucher_items.deleteMany({
        where: { voucher_id: voucherId },
      });
      await tx.expensevouchers.delete({
        where: { id: voucherId },
      });
    });

    return res.json({
      status: true,
      message: "Expense Voucher deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Expense Voucher Error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to delete expense voucher",
      error: error.message,
    });
  }
};