import { uploadToCloudinary } from "../config/cloudinary.js";
import prisma from "../config/db.js";


// Utility: Safe number conversion
const toNumber = (val) => {
  if (val == null) return 0;
  if (typeof val === 'object' && typeof val.toNumber === 'function') {
    return val.toNumber();
  }
  return Number(val);
};

// ✅ CREATE Contra Voucher
// export const createContraVoucher = async (req, res) => {
//   try {
//     const {
//       voucher_no_manual,
//       voucher_date,
//       account_from_id,
//       account_to_id,
//       amount,
//       narration,
//     } = req.body;

//     let document = null;

//     if (req.files?.document) {
//       const result = await cloudinary.uploader.upload(
//         req.files.document.tempFilePath,
//         { folder: "contra_vouchers" }
//       );
//       document = result.secure_url;
//     }

//     const voucher_no_auto = `CON-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

//     const newVoucher = await prisma.contra_vouchers.create({
//       data: {
//         voucher_no_auto,
//         voucher_no_manual: voucher_no_manual || null,
//         voucher_date: new Date(voucher_date),
//         account_from_id: parseInt(account_from_id),
//         account_to_id: parseInt(account_to_id),
//         amount: parseFloat(amount),
//         document: document || null,
//         narration: narration || null,
//       },
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Contra Voucher created successfully",
//       data: { voucher_no_auto: newVoucher.voucher_no_auto },
//     });
//   } catch (error) {
//     console.error("Error creating contra voucher:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to create contra voucher",
//       error: error.message,
//     });
//   }
// };
// export const createContraVoucher = async (req, res) => {
//   try {
//     const {
//       company_id,
//       voucher_no_manual,
//       voucher_date,
//       account_from_id,
//       account_to_id,
//       amount,
//       narration,
//     } = req.body;

//     // 🧩 Validate required fields
//     if (!company_id || !account_from_id || !account_to_id || !amount || !voucher_date) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields (company_id, account_from_id, account_to_id, amount, voucher_date).",
//       });
//     }

//     let documentUrl = null;

//     // 🖼️ Upload file to Cloudinary (multer.memoryStorage)
//     if (req.files?.document?.[0]) {
//       const fileBuffer = req.files.document[0].buffer;
//       documentUrl = await uploadToCloudinary(fileBuffer, "contra_vouchers");
//     }

//     // 🧾 Auto-generate voucher number
//     const voucher_no_auto = `CON-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

//     // 🧮 Create voucher record (with correct relations)
//     const newVoucher = await prisma.contra_vouchers.create({
//       data: {
//         voucher_no_auto,
//         company_id: parseInt(company_id),
//         voucher_no_manual: voucher_no_manual || null,
//         voucher_date: new Date(voucher_date),
//         amount: parseFloat(amount),
//         document: documentUrl || null,
//         narration: narration || null,

//         // ✅ Connect relations properly (instead of using _id fields)
//         account_from: { connect: { id: parseInt(account_from_id) } },
//         account_to: { connect: { id: parseInt(account_to_id) } },
//       },
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Contra Voucher created successfully",
//       data: newVoucher,
//     });
//   } catch (error) {
//     console.error("❌ Error creating contra voucher:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to create contra voucher",
//       error: error.message,
//     });
//   }
// };


export const createContraVoucher = async (req, res) => {
  try {
    const {
      company_id,
      voucher_date,
      account_from_id,
      account_to_id,
      amount,
      narration,
      voucher_number, // 👈 add this if it comes from frontend (manual)
    } = req.body;

    // 🧩 Validate required fields
    if (!company_id || !account_from_id || !account_to_id || !amount || !voucher_date) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields (company_id, account_from_id, account_to_id, amount, voucher_date).",
      });
    }

    let documentUrl = null;

    // 🖼️ Upload file to Cloudinary (multer.memoryStorage)
    if (req.files?.document?.[0]) {
      const fileBuffer = req.files.document[0].buffer;
      documentUrl = await uploadToCloudinary(fileBuffer, "contra_vouchers");
    }

    // 🧾 Auto-generate voucher number (if not provided)
    const voucher_no_auto = `CON-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const finalVoucherNumber = voucher_number || voucher_no_auto; // ✅ fallback if manual not given

    // 🧮 Create voucher record (with correct relations)
    const newVoucher = await prisma.contra_vouchers.create({
      data: {
        voucher_number: finalVoucherNumber, // ✅ REQUIRED FIELD
        voucher_no_auto,
        company_id: parseInt(company_id),
        
        voucher_date: new Date(voucher_date),
        amount: parseFloat(amount),
        document: documentUrl || null,
        narration: narration || null,

        // ✅ Connect relations properly
        account_from: { connect: { id: parseInt(account_from_id) } },
        account_to: { connect: { id: parseInt(account_to_id) } },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Contra Voucher created successfully",
      data: newVoucher,
    });
  } catch (error) {
    console.error("❌ Error creating contra voucher:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create contra voucher",
      error: error.message,
    });
  }
};





// ✅ GET All Contra Vouchers (with account names)
export const getAllContraVouchers = async (req, res) => {
  try {
    const vouchers = await prisma.contra_vouchers.findMany({
      include: {
        account_from: { select: { account_name: true } }, // ✅ Changed from 'name' to 'account_name'
        account_to: { select: { account_name: true } },   // ✅ Changed from 'name' to 'account_name'
      },
      orderBy: { id: 'desc' },
    });

    const formatted = vouchers.map(v => ({
      ...v,
      account_from_name: v.account_from?.account_name || null, // ✅ Use account_name
      account_to_name: v.account_to?.account_name || null,     // ✅ Use account_name
      amount: toNumber(v.amount),
    }));

    return res.status(200).json({
      success: true,
      message: "Contra Vouchers fetched successfully",
      data: formatted,
    });
  } catch (error) {
    console.error("Error fetching contra vouchers:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch contra vouchers",
      error: error.message,
    });
  }
};

// ✅ GET Contra Voucher By ID
export const getContraVoucherById = async (req, res) => {
  try {
    const { id } = req.params;
    const voucherId = parseInt(id);

    const voucher = await prisma.contra_vouchers.findUnique({
      where: { id: voucherId },
      include: {
        account_from: { select: { account_name: true } }, // ✅ Changed
        account_to: { select: { account_name: true } },   // ✅ Changed
      },
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Contra Voucher not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contra Voucher fetched successfully",
      data: {
        ...voucher,
        account_from_name: voucher.account_from?.account_name || null, // ✅
        account_to_name: voucher.account_to?.account_name || null,     // ✅
        amount: toNumber(voucher.amount),
      },
    });
  } catch (error) {
    console.error("Error fetching contra voucher by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch contra voucher",
      error: error.message,
    });
  }
};

// ✅ UPDATE Contra Voucher
// export const updateContraVoucher = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const voucherId = parseInt(id);

//     const existing = await prisma.contra_vouchers.findUnique({ where: { id: voucherId } });
//     if (!existing) {
//       return res.status(404).json({
//         success: false,
//         message: "Contra Voucher not found",
//       });
//     }

//     let document = existing.document;

//     if (req.files?.document) {
//       const result = await cloudinary.uploader.upload(
//         req.files.document.tempFilePath,
//         { folder: "contra_vouchers" }
//       );
//       document = result.secure_url;
//     }

//     const data = {};
//     if (req.body.voucher_no_manual !== undefined) data.voucher_no_manual = req.body.voucher_no_manual || null;
//     if (req.body.voucher_date !== undefined) data.voucher_date = new Date(req.body.voucher_date);
//     if (req.body.account_from_id !== undefined) data.account_from_id = parseInt(req.body.account_from_id);
//     if (req.body.account_to_id !== undefined) data.account_to_id = parseInt(req.body.account_to_id);
//     if (req.body.amount !== undefined) data.amount = parseFloat(req.body.amount);
//     if (req.body.narration !== undefined) data.narration = req.body.narration || null;
//     if (document !== undefined) data.document = document;

//     const updated = await prisma.contra_vouchers.update({
//       where: { id: voucherId },
//       data,
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Contra Voucher updated successfully",
//     });
//   } catch (error) {
//     console.error("Error updating contra voucher:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update contra voucher",
//       error: error.message,
//     });
//   }
// };

export const updateContraVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const voucherId = parseInt(id);

    // 🔍 Check if voucher exists
    const existing = await prisma.contra_vouchers.findUnique({ where: { id: voucherId } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Contra Voucher not found",
      });
    }

    // 🖼️ Handle document replacement
    let documentUrl = existing.document;

    if (req.files?.document?.[0]) {
      // 🧹 Delete old document from Cloudinary if it exists
      if (existing.document) {
        try {
          const publicId = existing.document.split("/").pop().split(".")[0];
          await deleteFromCloudinary(`contra_vouchers/${publicId}`);
        } catch (err) {
          console.warn("⚠️ Cloudinary delete failed:", err.message);
        }
      }

      // ☁️ Upload new document
      const fileBuffer = req.files.document[0].buffer;
      documentUrl = await uploadToCloudinary(fileBuffer, "contra_vouchers");
    }

    // 🧩 Prepare update data dynamically (only provided fields)
    const data = {};
    
    if (req.body.voucher_date !== undefined)
      data.voucher_date = new Date(req.body.voucher_date);
    if (req.body.account_from_id !== undefined)
      data.account_from_id = parseInt(req.body.account_from_id);
    if (req.body.account_to_id !== undefined)
      data.account_to_id = parseInt(req.body.account_to_id);
    if (req.body.amount !== undefined)
      data.amount = parseFloat(req.body.amount);
    if (req.body.narration !== undefined)
      data.narration = req.body.narration || null;
    if (documentUrl !== undefined)
      data.document = documentUrl;

    // 🧾 Update record
    const updated = await prisma.contra_vouchers.update({
      where: { id: voucherId },
      data,
    });

    return res.status(200).json({
      success: true,
      message: "Contra Voucher updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("❌ Error updating contra voucher:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update contra voucher",
      error: error.message,
    });
  }
};

// ✅ DELETE Contra Voucher
// export const deleteContraVoucher = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const voucherId = parseInt(id);

//     const existing = await prisma.contra_vouchers.findUnique({ where: { id: voucherId } });
//     if (!existing) {
//       return res.status(404).json({
//         success: false,
//         message: "Contra Voucher not found",
//       });
//     }

//     await prisma.contra_vouchers.delete({ where: { id: voucherId } });

//     return res.status(200).json({
//       success: true,
//       message: "Contra Voucher deleted successfully",
//     });
//   } catch (error) {
//     console.error("Error deleting contra voucher:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to delete contra voucher",
//       error: error.message,
//     });
//   }
// };
export const deleteContraVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const voucherId = parseInt(id);

    // 🔍 Find the voucher
    const existing = await prisma.contra_vouchers.findUnique({
      where: { id: voucherId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Contra Voucher not found",
      });
    }

    // 🖼️ Delete document from Cloudinary if it exists
    if (existing.document) {
      try {
        const publicId = existing.document.split("/").pop().split(".")[0];
        await deleteFromCloudinary(`contra_vouchers/${publicId}`);
      } catch (error) {
        console.warn("⚠️ Failed to delete image from Cloudinary:", error.message);
      }
    }

    // 🗑️ Delete record from database
    await prisma.contra_vouchers.delete({
      where: { id: voucherId },
    });

    return res.status(200).json({
      success: true,
      message: "Contra Voucher deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting contra voucher:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete contra voucher",
      error: error.message,
    });
  }
};

// ✅ GET Accounts for dropdown
export const getAccounts = async (req, res) => {
  try {
    const accounts = await prisma.accounts.findMany({
      select: { id: true, account_name: true }, // ✅ Changed from 'name' to 'account_name'
    });

    // Optional: rename field to 'name' in response for frontend simplicity
    const formattedAccounts = accounts.map(acc => ({
      id: acc.id,
      name: acc.account_name, // frontend ko 'name' dikhayenge
    }));

    return res.status(200).json({
      success: true,
      message: "Accounts fetched successfully",
      data: formattedAccounts,
    });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch accounts",
      error: error.message,
    });
  }
};



export const getContraVouchersByCompany = async (req, res) => {
  try {
    const { company_id } = req.params;

    const companyId = parseInt(company_id);
    if (isNaN(companyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid company ID",
      });
    }

    const vouchers = await prisma.contra_vouchers.findMany({
      where: { company_id: companyId },
      orderBy: { id: "desc" },
    });

    if (vouchers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No contra vouchers found for this company",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contra vouchers fetched successfully",
      data: vouchers,
    });
  } catch (error) {
    console.error("❌ Error fetching contra vouchers by company:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch contra vouchers",
      error: error.message,
    });
  }
};