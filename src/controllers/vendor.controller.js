import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../config/cloudinary.js";
import prisma from "../config/db.js";

export const createVendor = async (req, res) => {
  try {
    const {
      company_id,
      name_english,
      name_arabic,
      company_name,
      google_location,
      account_type,
      balance_type,
      account_name,
      account_balance,
      creation_date,
      bank_account_number,
      bank_ifsc,
      bank_name_branch,
      country,
      state,
      pincode,
      address,
      state_code,
      shipping_address,
      phone,
      email,
      credit_period_days,
      enable_gst,
      gstIn,
      type,
    } = req.body;

    if (!company_id || !name_english || !type) {
      return res.status(400).json({
        success: false,
        message: "company_id and name_english are required",
      });
    }

    // 📤 Upload files to Cloudinary
    let idCardImageUrl = null;
    let anyFileUrl = null;

    if (req.files?.id_card_image?.[0]) {
      idCardImageUrl = await uploadToCloudinary(
        req.files.id_card_image[0].buffer,
        "vendorsCustomer/id_cards"
      );
    }

    if (req.files?.any_file?.[0]) {
      anyFileUrl = await uploadToCloudinary(
        req.files.any_file[0].buffer,
        "vendorsCustomer/files"
      );
    }

    // ✅ Save Vendor
    const vendor = await prisma.vendorsCustomer.create({
      data: {
        company_id: parseInt(company_id),
        name_english,
        name_arabic,
        company_name,
        google_location,
        id_card_image: idCardImageUrl,
        any_file: anyFileUrl,
        account_type,
        balance_type,
        account_name,
        account_balance: account_balance ? parseFloat(account_balance) : 0.0,
        creation_date: creation_date ? new Date(creation_date) : undefined,
        bank_account_number,
        bank_ifsc,
        bank_name_branch,
        country,
        state,
        pincode,
        address,
        state_code,
        shipping_address,
        phone,
        email,
        type,
        credit_period_days: credit_period_days
          ? parseInt(credit_period_days)
          : 0,
        enable_gst: enable_gst === true || enable_gst === "true",
        gstIn,
      },
    });

    res.status(201).json({
      success: true,
      message: "Vendor created successfully",
      data: vendor,
    });
  } catch (error) {
    console.error("❌ Error creating vendor:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllVendors = async (req, res) => {
  try {
    const vendors = await prisma.vendorsCustomer.findMany({
      orderBy: { created_at: "desc" },
      include: { company: { select: { id: true, name: true, email: true } } },
    });
    res.status(200).json({
      success: true,
      message: "Vendors fetched successfully",
      data: vendors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVendorsByCompanyId = async (req, res) => {
  try {
    const { company_id } = req.params;
    const { type } = req.query;
    const vendors = await prisma.vendorsCustomer.findMany({
      where: {
        company_id: parseInt(company_id),
        type,
      },
      orderBy: { created_at: "desc" },
    });

    res.status(200).json({
      success: true,
      message: `${type}s fetched successfully`,
      data: vendors,
    });
  } catch (error) {
    console.error("Error fetching vendor/customers:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await prisma.vendorsCustomer.findUnique({
      where: { id: parseInt(id) },
      include: { company: { select: { id: true, name: true } } },
    });

    if (!vendor)
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });

    res.status(200).json({
      success: true,
      message: "Vendor fetched successfully",
      data: vendor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const vendor = await prisma.vendorsCustomer.findUnique({
      where: { id: parseInt(id) },
    });

    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    }

    let idCardImageUrl = vendor.id_card_image;
    let anyFileUrl = vendor.any_file;

    // ✅ If new ID card image uploaded → delete old from Cloudinary
    if (req.files?.id_card_image?.[0]) {
      if (vendor.id_card_image) {
        const publicId = vendor.id_card_image.split("/").pop().split(".")[0];
        await deleteFromCloudinary(publicId);
      }

      const uploaded = await uploadToCloudinary(
        req.files.id_card_image[0].buffer,
        "vendorsCustomer/id_cards"
      );
      idCardImageUrl = uploaded;
    }

    // ✅ If new file uploaded → delete old from Cloudinary
    if (req.files?.any_file?.[0]) {
      if (vendor.any_file) {
        const publicId = vendor.any_file.split("/").pop().split(".")[0];
        await deleteFromCloudinary(publicId);
      }

      const uploaded = await uploadToCloudinary(
        req.files.any_file[0].buffer,
        "vendorsCustomer/files"
      );
      anyFileUrl = uploaded;
    }

    // ✅ Convert numeric fields safely
    const numericData = {
      company_id: data.company_id ? parseInt(data.company_id) : null,
      account_balance: data.account_balance
        ? parseFloat(data.account_balance)
        : null,
      credit_period_days: data.credit_period_days
        ? parseInt(data.credit_period_days)
        : null,
      enable_gst: data.enable_gst === "1" || data.enable_gst === true, // handle boolean-like fields
    };

    // ✅ Merge and update vendor
    const updatedVendor = await prisma.vendorsCustomer.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        ...numericData,
        id_card_image: idCardImageUrl,
        any_file: anyFileUrl,
      },
    });

    res.status(200).json({
      success: true,
      message: "Vendor updated successfully",
      data: updatedVendor,
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await prisma.vendorsCustomer.findUnique({
      where: { id: parseInt(id) },
    });

    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    }

    // ✅ Delete images/files from Cloudinary if they exist
    if (vendor.id_card_image) {
      const publicId = vendor.id_card_image.split("/").pop().split(".")[0];
      await deleteFromCloudinary(publicId);
    }

    if (vendor.any_file) {
      const publicId = vendor.any_file.split("/").pop().split(".")[0];
      await deleteFromCloudinary(publicId);
    }

    // ✅ Delete vendor record from DB
    await prisma.vendorsCustomer.delete({ where: { id: parseInt(id) } });

    res.status(200).json({
      success: true,
      message: "vendorsCustomer and associated files deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting vendorsCustomer:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// export const getVendorLedger = async (req, res) => {

//   try {
//     const { vendor_id, company_id } = req.params;
//     const { from_date, to_date } = req.query;

//     if (!vendor_id || !company_id) {
//       return res.status(400).json({
//         success: false,
//         message: "vendor_id and company_id are required",
//       });
//     }

//     // 1️⃣ Get Vendor
//     const vendor = await prisma.vendorsCustomer.findUnique({
//       where: { id: Number(vendor_id) },
//       include: {
//         company: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             company_logo_url: true,
//           },
//         },
//       },
//     });

//     if (!vendor) {
//       return res.status(404).json({
//         success: false,
//         message: "Vendor not found",
//       });
//     }

//     // 2️⃣ Build query filter
//     const where = {
//       company_id: Number(company_id),
//       OR: [
//         { from_id: Number(vendor_id) },
//         { account_type: "vendor" },
//         { from_type: "vendor" },
//       ],
//     };

//     if (from_date && to_date) {
//       where.date = {
//         gte: String(from_date),
//         lte: String(to_date),
//       };
//     }

//     // 3️⃣ Fetch transactions
//     const transactions = await prisma.transactions.findMany({
//       where,
//       orderBy: { id: "asc" },
//     });

//     let totalDebit = 0;
//     let totalCredit = 0;
//     const formattedTxns = [];

//     // 4️⃣ Opening Balance (place in correct side)
//     let currentBalance = 0;
//     let currentBalanceType = "Cr"; // default

//     if (vendor.account_balance && vendor.account_balance !== 0) {
//       const isDebit =
//         vendor.balance_type?.toLowerCase() === "dr" ||
//         vendor.balance_type?.toLowerCase() === "debit";
//       const isCredit =
//         vendor.balance_type?.toLowerCase() === "cr" ||
//         vendor.balance_type?.toLowerCase() === "credit";

//       const openingDebit = isDebit ? Number(vendor.account_balance) : 0;
//       const openingCredit = isCredit ? Number(vendor.account_balance) : 0;

//       currentBalance = Math.abs(openingCredit - openingDebit);
//       currentBalanceType = openingCredit > openingDebit ? "Cr" : "Dr";

//       formattedTxns.push({
//         date: vendor.creation_date
//           ? vendor.creation_date.toISOString().split("T")[0]
//           : "-",
//         particulars: "Opening Balance",
//         vch_no: "--",
//         vch_type: "Opening",
//         debit: openingDebit.toFixed(2),
//         credit: openingCredit.toFixed(2),
//         balance_type: currentBalanceType,
//         balance: `₹${currentBalance.toLocaleString("en-IN", {
//           minimumFractionDigits: 2,
//         })} ${currentBalanceType}`,
//       });

//       totalDebit += openingDebit;
//       totalCredit += openingCredit;
//     }

//     // 5️⃣ Loop through transactions
//     transactions.forEach((t) => {
//       // Normalize balance_type
//       const type = (t.balance_type || "").toLowerCase();

//       const isDebit =
//         ["dr", "debit", "payment", "make payment"].includes(type);
//       const isCredit = ["cr", "credit", "purchase", "sales return"].includes(
//         type
//       );

//       const debit = isDebit ? Number(t.amount) : 0;
//       const credit = isCredit ? Number(t.amount) : 0;

//       totalDebit += debit;
//       totalCredit += credit;

//       // 🧮 Running balance update
//       if (currentBalanceType === "Cr") {
//         if (credit > 0) currentBalance += credit;
//         else if (debit > 0) currentBalance -= debit;
//       } else {
//         if (debit > 0) currentBalance += debit;
//         else if (credit > 0) currentBalance -= credit;
//       }

//       if (currentBalance < 0) {
//         currentBalance = Math.abs(currentBalance);
//         currentBalanceType = currentBalanceType === "Cr" ? "Dr" : "Cr";
//       }

//       formattedTxns.push({
//         date: t.date || "-",
//         particulars: t.note || "-",
//         vch_no: t.voucher_no || "-",
//         vch_type: t.voucher_type || "-",
//         debit: debit.toFixed(2),
//         credit: credit.toFixed(2),
//         balance_type: type,
//         balance: `₹${currentBalance.toLocaleString("en-IN", {
//           minimumFractionDigits: 2,
//         })} ${currentBalanceType}`,
//       });
//     });

//     // 6️⃣ Outstanding balance
//     const outstandingBalance = totalCredit - totalDebit;
//     const finalType = outstandingBalance >= 0 ? "Cr" : "Dr";

//     // 7️⃣ Send response
//     res.json({
//       success: true,
//       vendor: {
//         id: vendor.id,
//         name: vendor.name_english,
//         company_name: vendor.company_name || "",
//         phone: vendor.phone,
//         email: vendor.email,
//         company_logo_url: vendor.company?.company_logo_url || null,
//       },
//       summary: {
//         total_payments: Number(totalDebit.toFixed(2)),
//         total_purchases: Number(totalCredit.toFixed(2)),
//         outstanding_balance: Math.abs(Number(outstandingBalance.toFixed(2))),
//         balance_type: finalType,
//       },
//       transactions: formattedTxns,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching vendor ledger:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching vendor ledger",
//       error: error.message,
//     });
//   }
// };

// export const getVendorLedger = async (req, res) => {
//   try {
//     const { vendor_id, company_id } = req.params;
//     const { from_date, to_date } = req.query;

//     if (!vendor_id || !company_id) {
//       return res.status(400).json({
//         success: false,
//         message: "vendor_id and company_id are required",
//       });
//     }

//     // 1️⃣ Get Vendor
//     const vendor = await prisma.vendorsCustomer.findUnique({
//       where: { id: Number(vendor_id) },
//       include: {
//         company: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             company_logo_url: true,
//           },
//         },
//       },
//     });

//     if (!vendor) {
//       return res.status(404).json({
//         success: false,
//         message: "Vendor not found",
//       });
//     }

//     // 2️⃣ Build filter
//     const where = {
//       company_id: Number(company_id),
//       OR: [
//         { from_id: Number(vendor_id) },
//         { account_type: "vendor" },
//         { from_type: "vendor" },
//       ],
//     };

//     if (from_date && to_date) {
//       where.date = {
//         gte: String(from_date),
//         lte: String(to_date),
//       };
//     }

//     // 3️⃣ Fetch transactions
//     const transactions = await prisma.transactions.findMany({
//       where,
//       orderBy: { id: "asc" },
//     });

//     let totalDebit = 0;
//     let totalCredit = 0;
//     const formattedTxns = [];

//     // 4️⃣ Opening Balance
//     let currentBalance = 0;
//     let currentBalanceType = "Cr";

//     if (vendor.account_balance && vendor.account_balance !== 0) {
//       const isDebit =
//         vendor.balance_type?.toLowerCase() === "dr" ||
//         vendor.balance_type?.toLowerCase() === "debit";
//       const isCredit =
//         vendor.balance_type?.toLowerCase() === "cr" ||
//         vendor.balance_type?.toLowerCase() === "credit";

//       const openingDebit = isDebit ? Number(vendor.account_balance) : 0;
//       const openingCredit = isCredit ? Number(vendor.account_balance) : 0;

//       currentBalance = Math.abs(openingCredit - openingDebit);
//       currentBalanceType = openingCredit > openingDebit ? "Cr" : "Dr";

//       formattedTxns.push({
//         date: vendor.creation_date
//           ? vendor.creation_date.toISOString().split("T")[0]
//           : "-",
//         particulars: "Opening Balance",
//         vch_no: "--",
//         vch_type: "Opening",
//         debit: openingDebit.toFixed(2),
//         credit: openingCredit.toFixed(2),
//         balance_type: currentBalanceType,
//         balance: `₹${currentBalance.toLocaleString("en-IN", {
//           minimumFractionDigits: 2,
//         })} ${currentBalanceType}`,
//       });

//       totalDebit += openingDebit;
//       totalCredit += openingCredit;
//     }

//     // 5️⃣ Loop over transactions
//     transactions.forEach((t) => {
//       const type = (t.balance_type || "").toLowerCase();
//       const voucherType = (t.voucher_type || "").toLowerCase();

//       // Better classification
//       const isDebit =
//         ["dr", "debit", "payment", "make payment"].includes(type) ||
//         ["payment", "purchase return"].includes(voucherType);

//       const isCredit =
//         ["cr", "credit", "purchase"].includes(type) ||
//         ["purchase"].includes(voucherType);

//       const debit = isDebit ? Number(t.amount) : 0;
//       const credit = isCredit ? Number(t.amount) : 0;

//       totalDebit += debit;
//       totalCredit += credit;

//       // 🧮 Running balance logic
//       if (currentBalanceType === "Cr") {
//         if (credit > 0) currentBalance += credit;
//         else if (debit > 0) currentBalance -= debit;
//       } else {
//         if (debit > 0) currentBalance += debit;
//         else if (credit > 0) currentBalance -= credit;
//       }

//       if (currentBalance < 0) {
//         currentBalance = Math.abs(currentBalance);
//         currentBalanceType = currentBalanceType === "Cr" ? "Dr" : "Cr";
//       }

//       formattedTxns.push({
//         date: t.date || "-",
//         particulars: t.note || "-",
//         vch_no: t.voucher_no || "-",
//         vch_type: t.voucher_type || "-",
//         debit: debit.toFixed(2),
//         credit: credit.toFixed(2),
//         balance_type: currentBalanceType, // ✅ fixed
//         balance: `₹${currentBalance.toLocaleString("en-IN", {
//           minimumFractionDigits: 2,
//         })} ${currentBalanceType}`,
//       });
//     });

//     // 6️⃣ Outstanding Balance
//     const outstandingBalance = totalCredit - totalDebit;
//     const finalType = outstandingBalance >= 0 ? "Cr" : "Dr";

//     // 7️⃣ Send response
//     res.json({
//       success: true,
//       vendor: {
//         id: vendor.id,
//         name: vendor.name_english,
//         company_name: vendor.company_name || "",
//         phone: vendor.phone,
//         email: vendor.email,
//         company_logo_url: vendor.company?.company_logo_url || null,
//       },
//       summary: {
//         total_payments: Number(totalDebit.toFixed(2)),
//         total_purchases: Number(totalCredit.toFixed(2)),
//         outstanding_balance: Math.abs(Number(outstandingBalance.toFixed(2))),
//         balance_type: finalType,
//       },
//       transactions: formattedTxns,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching vendor ledger:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching vendor ledger",
//       error: error.message,
//     });
//   }
// };

// export const getTransactionSummary = async (req, res) => {
//   try {
//     const { company_id } = req.params;

//     if (!company_id) {
//       return res.status(400).json({
//         success: false,
//         message: "Company ID is required",
//       });
//     }

//     const companyId = parseInt(company_id);

//     // 🧩 Query counts from each relevant table
//     const [
//       openingBalanceCount,
//       purchaseCount,
//       paymentCount,
//       purchaseReturnCount,
//       expenseCount,
//       receiptCount,
//       salesReturnCount,
//       manufacturingCount,
//       stockJournalCount,
//       stockAdjustmentCount,
//       bankingCount,
//       journalCount,
//     ] = await Promise.all([
//       // Opening Balance (from accounts)
//       prisma.accounts.count({
//         where: { company_id: companyId },
//       }),

//       // Purchase (from purchaseorder)
//       prisma.purchaseorder.count({
//         where: { company_id: companyId },
//       }),

//       // Payment (from expensevouchers)
//       prisma.expensevouchers.count({
//         where: { company_id: companyId },
//       }),

//       // Purchase Return
//       prisma.purchase_return.count({
//         where: { company_id: companyId },
//       }),

//       // Expense (also from expensevouchers)
//       prisma.expensevouchers.count({
//         where: { company_id: companyId },
//       }),

//       // Receipt (from income_vouchers)
//       prisma.income_vouchers.count({
//         where: { company_id: companyId },
//       }),

//       // Sales Return
//       prisma.sales_return.count({
//         where: { company_id: companyId },
//       }),

//       // Manufacturing (no direct model found, return 0 for now)
//       Promise.resolve(0),

//       // Stock Journal (transfers)
//       prisma.transfers.count({
//         where: { company_id: companyId },
//       }),

//       // Stock Adjustment
//       prisma.adjustments.count({
//         where: { company_id: companyId },
//       }),

//       // Banking (contra_vouchers)
//       prisma.contra_vouchers.count({
//         where: { company_id: companyId },
//       }),

//       // Journal (vouchers)
//       prisma.vouchers.count({
//         where: { company_id: companyId },
//       }),
//     ]);

//     // 🧾 Combine results
//     const summary = {
//       "Opening Balance": openingBalanceCount,
//       "Purchase": purchaseCount,
//       "Payment": paymentCount,
//       "Purchase Return": purchaseReturnCount,
//       "Expense": expenseCount,
//       "Receipt": receiptCount,
//       "Sales Return": salesReturnCount,
//       "Manufacturing": manufacturingCount,
//       "Stock Journal": stockJournalCount,
//       "Stock Adjustment": stockAdjustmentCount,
//       "Banking": bankingCount,
//       "Journal": journalCount,
//     };

//     const totalTransactions = Object.values(summary).reduce((a, b) => a + b, 0);

//     return res.status(200).json({
//       success: true,
//       message: "✅ Transaction summary fetched successfully",
//       data: {
//         ...summary,
//         "Total Transactions": totalTransactions,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error fetching transaction summary:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

export const getVendorLedger = async (req, res) => {
  try {
    const { vendor_id, company_id } = req.params;
    const { from_date, to_date } = req.query;

    if (!vendor_id || !company_id) {
      return res.status(400).json({
        success: false,
        message: "vendor_id and company_id are required",
      });
    }

    const companyId = Number(company_id);
    const vendorId = Number(vendor_id);

    // 1️⃣ Get Vendor Info
    const vendor = await prisma.vendorsCustomer.findUnique({
      where: { id: vendorId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            company_logo_url: true,
          },
        },
      },
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // 2️⃣ Build Transaction Filter
    const where = {
      company_id: companyId,
      OR: [
        { from_id: vendorId },
        { account_type: "vendor" },
        { from_type: "vendor" },
      ],
    };

    if (from_date && to_date) {
      where.date = {
        gte: String(from_date),
        lte: String(to_date),
      };
    }

    // 3️⃣ Fetch vendor-specific transactions
    const transactions = await prisma.transactions.findMany({
      where,
      orderBy: { id: "asc" },
    });

    let totalDebit = 0;
    let totalCredit = 0;
    const formattedTxns = [];

    // 4️⃣ Opening Balance
    let currentBalance = 0;
    let currentBalanceType = "Cr";

    if (vendor.account_balance && vendor.account_balance !== 0) {
      const isDebit =
        vendor.balance_type?.toLowerCase() === "dr" ||
        vendor.balance_type?.toLowerCase() === "debit";
      const isCredit =
        vendor.balance_type?.toLowerCase() === "cr" ||
        vendor.balance_type?.toLowerCase() === "credit";

      const openingDebit = isDebit ? Number(vendor.account_balance) : 0;
      const openingCredit = isCredit ? Number(vendor.account_balance) : 0;

      currentBalance = Math.abs(openingCredit - openingDebit);
      currentBalanceType = openingCredit > openingDebit ? "Cr" : "Dr";

      formattedTxns.push({
        date: vendor.creation_date
          ? vendor.creation_date.toISOString().split("T")[0]
          : "-",
        particulars: "Opening Balance",
        vch_no: "--",
        vch_type: "Opening",
        debit: openingDebit.toFixed(2),
        credit: openingCredit.toFixed(2),
        balance_type: currentBalanceType,
        balance: `₹${currentBalance.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        })} ${currentBalanceType}`,
      });

      totalDebit += openingDebit;
      totalCredit += openingCredit;
    }

    // 5️⃣ Loop through transactions
    transactions.forEach((t) => {
      const type = (t.balance_type || "").toLowerCase();
      const voucherType = (t.voucher_type || "").toLowerCase();

      const isDebit =
        ["dr", "debit", "payment", "make payment"].includes(type) ||
        ["payment", "purchase return"].includes(voucherType);

      const isCredit =
        ["cr", "credit", "purchase"].includes(type) ||
        ["purchase"].includes(voucherType);

      const debit = isDebit ? Number(t.amount) : 0;
      const credit = isCredit ? Number(t.amount) : 0;

      totalDebit += debit;
      totalCredit += credit;

      // 🧮 Running Balance Logic
      if (currentBalanceType === "Cr") {
        if (credit > 0) currentBalance += credit;
        else if (debit > 0) currentBalance -= debit;
      } else {
        if (debit > 0) currentBalance += debit;
        else if (credit > 0) currentBalance -= credit;
      }

      if (currentBalance < 0) {
        currentBalance = Math.abs(currentBalance);
        currentBalanceType = currentBalanceType === "Cr" ? "Dr" : "Cr";
      }

      formattedTxns.push({
        date: t.date || "-",
        particulars: t.note || "-",
        vch_no: t.voucher_no || "-",
        vch_type: t.voucher_type || "-",
        debit: debit.toFixed(2),
        credit: credit.toFixed(2),
        balance_type: currentBalanceType,
        balance: `₹${currentBalance.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        })} ${currentBalanceType}`,
      });
    });

    // 6️⃣ Outstanding Balance
    const outstandingBalance = totalCredit - totalDebit;
    const finalType = outstandingBalance >= 0 ? "Cr" : "Dr";

    // 7️⃣ Global Transaction Summary
    const [
      openingBalanceCount,
      purchaseCount,
      paymentCount,
      purchaseReturnCount,
      expenseCount,
      receiptCount,
      salesReturnCount,
      manufacturingCount,
      stockJournalCount,
      stockAdjustmentCount,
      bankingCount,
      journalCount,
    ] = await Promise.all([
      prisma.accounts.count({ where: { company_id: companyId } }),
      prisma.purchaseorder.count({ where: { company_id: companyId } }),
      prisma.expensevouchers.count({ where: { company_id: companyId } }),
      prisma.purchase_return.count({ where: { company_id: companyId } }),
      prisma.expensevouchers.count({ where: { company_id: companyId } }),
      prisma.income_vouchers.count({ where: { company_id: companyId } }),
      prisma.sales_return.count({ where: { company_id: companyId } }),
      Promise.resolve(0),
      prisma.transfers.count({ where: { company_id: companyId } }),
      prisma.adjustments.count({ where: { company_id: companyId } }),
      prisma.contra_vouchers.count({ where: { company_id: companyId } }),
      prisma.vouchers.count({ where: { company_id: companyId } }),
    ]);

    const transactionSummary = {
      opening_balance: openingBalanceCount,
      purchase: purchaseCount,
      payment: paymentCount,
      purchase_return: purchaseReturnCount,
      expense: expenseCount,
      receipt: receiptCount,
      sales_return: salesReturnCount,
      manufacturing: manufacturingCount,
      stock_journal: stockJournalCount,
      stock_adjustment: stockAdjustmentCount,
      banking: bankingCount,
      journal: journalCount,
    };

    const totalTransactions = Object.values(transactionSummary).reduce(
      (a, b) => a + b,
      0
    );

    // 8️⃣ Final Response
    res.json({
      success: true,
      vendor: {
        id: vendor.id,
        name: vendor.name_english,
        company_name: vendor.company_name || "",
        phone: vendor.phone,
        email: vendor.email,
        company_logo_url: vendor.company?.company_logo_url || null,
      },
      ledger_summary: {
        total_payments: Number(totalDebit.toFixed(2)),
        total_purchases: Number(totalCredit.toFixed(2)),
        outstanding_balance: Math.abs(Number(outstandingBalance.toFixed(2))),
        balance_type: finalType,
      },
      transactions: formattedTxns,
      transaction_summary: {
        ...transactionSummary,
        total_transactions: totalTransactions,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching vendor ledger:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vendor ledger",
      error: error.message,
    });
  }
};
