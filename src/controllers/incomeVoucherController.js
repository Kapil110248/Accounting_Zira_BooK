import prisma from "../config/db.js";


// Utility: Convert to number safely (for Decimal/BigInt)
const toNumber = (val) => {
  if (val == null) return 0;
  if (typeof val === 'object' && typeof val.toNumber === 'function') {
    return val.toNumber();
  }
  return Number(val);
};

// 🔹 Create Income Voucher
export const createIncomeVoucher = async (req, res) => {
  try {
    const {
      company_id,
      auto_receipt_no,
      manual_receipt_no,
      voucher_date,
      deposited_to,
      received_from,
      narration,
      status,
      entries // array of { income_account, amount, row_narration }
    } = req.body;

    // ✅ Validate required fields
    if (!company_id || !auto_receipt_no || !voucher_date || !deposited_to || !entries?.length) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // ✅ Auto calculate total_amount
    const total_amount = entries.reduce((sum, e) => sum + toNumber(e.amount || 0), 0);

    // ✅ Create voucher and its entries in a transaction
    const newVoucher = await prisma.$transaction(async (tx) => {
      const voucher = await tx.income_vouchers.create({
        data: {
          company_id: parseInt(company_id),
          auto_receipt_no,
          manual_receipt_no: manual_receipt_no ?? null,
          voucher_date: new Date(voucher_date),
          deposited_to,
          received_from: received_from ? parseInt(received_from) : null,
          total_amount: toNumber(total_amount),
          narration: narration ?? null,
          status: status ?? "pending",
        },
      });

      // ✅ Create entries
      const entryData = entries.map(entry => ({
        voucher_id: voucher.id,
        income_account: entry.income_account ?? "Unknown",
        amount: toNumber(entry.amount ?? 0),
        row_narration: entry.row_narration ?? null,
      }));

      await tx.income_voucher_entries.createMany({
        data: entryData,
      });

      return voucher;
    });

    res.status(201).json({
      success: true,
      message: "Income voucher created successfully",
      voucher_id: newVoucher.id,
      total_amount: toNumber(newVoucher.total_amount)
    });

  } catch (error) {
    console.error("Create Income Voucher Error:", error);
    res.status(500).json({ success: false, message: "Failed to create voucher", error: error.message });
  }
};

// 🔹 GET vouchers by company_id
export const getIncomeVouchersByCompany = async (req, res) => {
  try {
    const { company_id } = req.params;

    if (!company_id) {
      return res.status(400).json({ success: false, message: "Company ID is required" });
    }

    // ✅ Fetch vouchers with their entries in one query using include
    const vouchers = await prisma.income_vouchers.findMany({
      where: {
        company_id: parseInt(company_id),
      },
      orderBy: {
        voucher_date: 'desc',
      },
      include: {
        income_voucher_entries: true, // This fetches all related entries
      },
    });

    // ✅ Format response
    const formattedVouchers = vouchers.map(v => ({
      id: toNumber(v.id),
      date: v.voucher_date,
      auto_receipt_no: v.auto_receipt_no,
      manual_receipt_no: v.manual_receipt_no,
      deposited_to: v.deposited_to,
      received_from: v.received_from,
      total_amount: toNumber(v.total_amount),
      narration: v.narration,
      status: v.status,
      entries: v.income_voucher_entries.map(e => ({
        entry_id: toNumber(e.id),
        voucher_id: toNumber(e.voucher_id),
        income_account: e.income_account,
        amount: toNumber(e.amount),
        row_narration: e.row_narration,
      })),
    }));

    res.json({
      success: true,
      count: formattedVouchers.length,
      data: formattedVouchers
    });

  } catch (error) {
    console.error("Get vouchers by company error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch vouchers", error: error.message });
  }
};

// 🔹 Update Income Voucher (only header fields)
export const patchIncomeVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Voucher ID is required" });
    }

    // अगर body empty है → कुछ update नहीं करना
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No fields provided for update" });
    }

    // ✅ Prepare update data - only allow valid fields
    const updateData = {};
    const validFields = [
      "auto_receipt_no",
      "manual_receipt_no",
      "voucher_date",
      "deposited_to",
      "received_from",
      "total_amount",
      "narration",
      "status"
    ];

    for (const [key, value] of Object.entries(updates)) {
      if (validFields.includes(key)) {
        if (key === "voucher_date") {
          updateData[key] = new Date(value); // Ensure it's a Date object
        } else if (key === "received_from" && value != null) {
          updateData[key] = parseInt(value); // Convert to Int if needed
        } else if (key === "total_amount") {
          updateData[key] = toNumber(value);
        } else {
          updateData[key] = value ?? null; // Handle nulls
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields provided for update" });
    }

    // ✅ Perform update
    const updatedVoucher = await prisma.income_vouchers.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        updated_at: new Date(), // Prisma will handle this automatically if you have @updatedAt, but explicitly set it.
      },
    });

    res.json({
      success: true,
      message: "Income voucher updated successfully",
      voucher_id: toNumber(updatedVoucher.id)
    });

  } catch (error) {
    console.error("Patch Income Voucher Error:", error);
    res.status(500).json({ success: false, message: "Failed to update voucher", error: error.message });
  }
};

// 🔹 Delete Income Voucher
export const deleteIncomeVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Voucher ID is required" });
    }

    // ✅ Delete voucher and its associated entries (Prisma will handle cascade if configured, otherwise do manually)
    // Since the relation is defined with onDelete: Cascade in your schema, deleting the parent should delete children.
    // But let's be explicit to ensure no orphaned records.
    await prisma.$transaction(async (tx) => {
      // First, delete entries (optional, but safe)
      await tx.income_voucher_entries.deleteMany({
        where: { voucher_id: parseInt(id) },
      });

      // Then, delete the voucher
      const result = await tx.income_vouchers.delete({
        where: { id: parseInt(id) },
      });

      if (!result) {
        throw new Error("Voucher not found");
      }
    });

    res.json({
      success: true,
      message: "Income voucher deleted successfully",
      voucher_id: parseInt(id)
    });

  } catch (error) {
    console.error("Delete Income Voucher Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete voucher", error: error.message });
  }
};