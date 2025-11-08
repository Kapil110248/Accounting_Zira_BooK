import { Prisma } from "@prisma/client";
import prisma from "../config/db.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../config/cloudinary.js";
// import { PrismaClient, Prisma } from "@prisma/client";


// import cloudinary from "cloudinary";
// import fs from "fs";

// const prisma = new PrismaClient();

// // Cloudinary Config
// cloudinary.v2.config({
//   cloud_name: "dkqcqrrbp",
//   api_key: "418838712271323",
//   api_secret: "p12EKWICdyHWx8LcihuWYqIruWQ",
// });

// /** Helper: Upload File to Cloudinary */
// const uploadFile = async (file, folder) => {
//   try {
//     const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
//       folder,
//       resource_type: "auto",
//     });
//     fs.unlinkSync(file.tempFilePath);
//     return result.secure_url;
//   } catch (err) {
//     if (fs.existsSync(file.tempFilePath)) fs.unlinkSync(file.tempFilePath);
//     throw err;
//   }
// };

/** ===================== CREATE VOUCHER ===================== */
// export const createVoucher = async (req, res) => {
//   const {
//     company_id,
//     voucher_type,
//     voucher_number,
//     manual_voucher_no,
//     date,
//     from_name,
//     from_email,
//     from_phone,
//     from_address,
//     to_name,
//     from_account,
//     to_account,
//     customer_id,
//     vendor_id,
//     notes,
//     transfer_amount,
//     items,
//   } = req.body;

//   const tx = await prisma.$transaction(async (tx) => {
//     try {
//       // Parse items safely
//       let parsedItems = [];
//       if (items) {
//         parsedItems = typeof items === "string" ? JSON.parse(items) : items;
//       }

//       // Upload logo & signature
//       let logoUrl = req.files?.logo
//         ? await uploadFile(req.files.logo, "vouchers/logo")
//         : null;
//       let signatureUrl = req.files?.signature
//         ? await uploadFile(req.files.signature, "vouchers/signature")
//         : null;

//       // Create Voucher
//       const voucher = await tx.vouchers.create({
//         data: {
//           company_id: Number(company_id),
//           voucher_type,
//           voucher_number,
//           manual_voucher_no,
//           date: new Date(date),
//           from_name,
//           from_email,
//           from_phone,
//           from_address,
//           to_name,
//           from_account: from_account ? Number(from_account) : null,
//           to_account: to_account ? Number(to_account) : null,
//           customer_id: customer_id ? Number(customer_id) : null,
//           vendor_id: vendor_id ? Number(vendor_id) : null,
//           notes,
//           transfer_amount: transfer_amount
//             ? new Prisma.Decimal(transfer_amount)
//             : null,
//           logo_url: logoUrl,
//           signature_url: signatureUrl,
//           status: "Pending",
//         },
//       });

//       // Insert Items
//       if (parsedItems.length > 0) {
//         await tx.voucher_items.createMany({
//           data: parsedItems.map((i) => ({
//             voucher_id: voucher.id,
//             item_name: i.item_name,
//             description: i.description,
//             hsn_code: i.hsn_code,
//             quantity: new Prisma.Decimal(i.quantity || 0),
//             rate: new Prisma.Decimal(i.rate || 0),
//             amount: new Prisma.Decimal(i.amount || 0),
//             tax_type: i.tax_type || "None",
//             tax_rate: new Prisma.Decimal(i.tax_rate || 0),
//             tax_amount: new Prisma.Decimal(i.tax_amount || 0),
//           })),
//         });
//       }

//       // Upload and save attachments
//       const handleUploads = async (type) => {
//         if (!req.files?.[type]) return;
//         const files = Array.isArray(req.files[type])
//           ? req.files[type]
//           : [req.files[type]];
//         for (let file of files) {
//           const url = await uploadFile(file, `vouchers/${type}`);
//           await tx.voucherAttachment.create({
//             data: {
//               voucher_id: voucher.id,
//               file_name: file.name,
//               file_type: file.mimetype,
//               file_url: url,
//               attachment_type: type,
//             },
//           });
//         }
//       };

//       await handleUploads("photos");
//       await handleUploads("references");

//       return voucher;
//     } catch (err) {
//       console.error("❌ Voucher Creation Error:", err);
//       throw err;
//     }
//   });

//   try {
//     res
//       .status(201)
//       .json({ success: true, message: "Voucher created successfully", data: tx });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
export const createVoucher = async (req, res) => {
  try {
    const {
      company_id,
      voucher_type,
      voucher_number,
      manual_voucher_no,
      date,
      from_name,
      from_email,
      from_phone,
      from_address,
      to_name,
      from_account,
      to_account,
      customer_id,
      vendor_id,
      notes,
      transfer_amount,
      items,
    } = req.body;

    // 🧩 Parse items safely
    let parsedItems = [];
    if (items) {
      parsedItems = typeof items === "string" ? JSON.parse(items) : items;
    }

    // 🖼️ Upload logo and signature (if provided)
    const logoBuffer = req.files?.logo?.[0]?.buffer;
    const signatureBuffer = req.files?.signature?.[0]?.buffer;

    const logoUrl = logoBuffer
      ? await uploadToCloudinary(logoBuffer, "vouchers/logo")
      : null;
    const signatureUrl = signatureBuffer
      ? await uploadToCloudinary(signatureBuffer, "vouchers/signature")
      : null;

    // Create voucher (without uploading attachments first)
    const createdVoucher = await prisma.vouchers.create({
      data: {
        company_id: Number(company_id),
        voucher_type,
        voucher_number,
        manual_voucher_no,
        date: new Date(date),
        from_name,
        from_email,
        from_phone,
        from_address,
        to_name,
        from_account: from_account ? Number(from_account) : null,
        to_account: to_account ? Number(to_account) : null,
        customer_id: customer_id ? Number(customer_id) : null,
        vendor_id: vendor_id ? Number(vendor_id) : null,
        notes,
        transfer_amount: transfer_amount
          ? new Prisma.Decimal(transfer_amount)
          : null,
        logo_url: logoUrl,
        signature_url: signatureUrl,
        status: "Pending",
      },
    });

    // 🧾 Insert voucher items (in a separate transaction)
    if (parsedItems.length > 0) {
      await prisma.voucher_items.createMany({
        data: parsedItems.map((i) => ({
          voucher_id: createdVoucher.id,
          item_name: i.item_name,
          description: i.description || null,
          hsn_code: i.hsn_code || null,
          quantity: new Prisma.Decimal(i.quantity || 0),
          rate: new Prisma.Decimal(i.rate || 0),
          amount: new Prisma.Decimal(i.amount || 0),
          tax_type: i.tax_type || "None",
          tax_rate: new Prisma.Decimal(i.tax_rate || 0),
          tax_amount: new Prisma.Decimal(i.tax_amount || 0),
        })),
      });
    }

    // 📎 Upload attachments (photos & references) — OUTSIDE of the main transaction
    const handleUploads = async (type, voucherId) => {
      const uploadedFiles = [];
      const files = req.files?.[type] || [];
      for (const file of files) {
        const url = await uploadToCloudinary(file.buffer, `vouchers/${type}`);
        uploadedFiles.push({
          voucher_id: voucherId,
          file_name: file.originalname,
          file_type: file.mimetype,
          file_url: url,
          attachment_type: type,
        });
      }
      if (uploadedFiles.length > 0) {
        await prisma.voucher_attachments.createMany({ data: uploadedFiles });
      }
    };

    // Handle file uploads outside the main transaction
    await handleUploads("photos", createdVoucher.id);
    await handleUploads("references", createdVoucher.id);

    // ✅ Success Response
    res.status(201).json({
      success: true,
      message: "Voucher created successfully",
      data: createdVoucher,
    });
  } catch (error) {
    console.error("❌ Voucher Creation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create voucher",
      error: error.message,
    });
  }
};

/** ===================== GET ALL VOUCHERS (By Company) ===================== */
export const getVouchersByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const vouchers = await prisma.vouchers.findMany({
      where: { company_id: Number(companyId) },
      include: {
        voucher_items: true,
        voucher_attachments: true,
        // voucher_payments: true
      },
      orderBy: { date: "desc" },
    });

    res.json({ success: true, data: vouchers });
  } catch (error) {
    console.error("Get Vouchers Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/** ===================== GET VOUCHER BY ID ===================== */
export const getVoucherById = async (req, res) => {
  try {
    const { id } = req.params;
    const voucher = await prisma.vouchers.findUnique({
      where: { id: Number(id) },
      include: {
        voucher_items: true,
        voucher_attachments: true,
        // voucher_payments: true
      },
    });

    if (!voucher)
      return res.status(404).json({ success: false, message: "Voucher not found" });

    res.json({ success: true, data: voucher });
  } catch (error) {
    console.error("Get Voucher Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/** ===================== UPDATE VOUCHER ===================== */
// export const updateVoucher = async (req, res) => {
//   const { id } = req.params;
//   const {
//     company_id,
//     voucher_type,
//     voucher_number,
//     manual_voucher_no,
//     date,
//     from_name,
//     from_email,
//     from_phone,
//     from_address,
//     to_name,
//     from_account,
//     to_account,
//     customer_id,
//     vendor_id,
//     notes,
//     transfer_amount,
//     status,
//     items,
//   } = req.body;

//   try {
//     const updated = await prisma.$transaction(async (tx) => {
//       let parsedItems = [];
//       if (items) parsedItems = typeof items === "string" ? JSON.parse(items) : items;

//       let logoUrl = req.files?.logo
//         ? await uploadFile(req.files.logo, "vouchers/logo")
//         : null;
//       let signatureUrl = req.files?.signature
//         ? await uploadFile(req.files.signature, "vouchers/signature")
//         : null;

//       const voucher = await tx.vouchers.update({
//         where: { id: Number(id) },
//         data: {
//           company_id: Number(company_id),
//           voucher_type,
//           voucher_number,
//           manual_voucher_no,
//           date: new Date(date),
//           from_name,
//           from_email,
//           from_phone,
//           from_address,
//           to_name,
//           from_account: from_account ? Number(from_account) : null,
//           to_account: to_account ? Number(to_account) : null,
//           customer_id: customer_id ? Number(customer_id) : null,
//           vendor_id: vendor_id ? Number(vendor_id) : null,
//           notes,
//           transfer_amount: transfer_amount
//             ? new Prisma.Decimal(transfer_amount) // ✅ Fixed here
//             : null,
//           status: status || "Pending",
//           logo_url: logoUrl ?? undefined,
//           signature_url: signatureUrl ?? undefined,
//         },
//       });

//       // Replace items
//       await tx.voucher_items.deleteMany({ where: { voucher_id: Number(id) } }); // ✅ Also fixed model name below
//       if (parsedItems.length > 0) {
//         await tx.voucher_items.createMany({ // ✅ Use `voucher_items`, not `voucherItem`
//           data: parsedItems.map((i) => ({
//             voucher_id: Number(id),
//             item_name: i.item_name,
//             description: i.description,
//             hsn_code: i.hsn_code,
//             quantity: new Prisma.Decimal(i.quantity || 0), // ✅ Fixed
//             rate: new Prisma.Decimal(i.rate || 0),        // ✅ Fixed
//             amount: new Prisma.Decimal(i.amount || 0),    // ✅ Fixed
//             tax_type: i.tax_type || "None",
//             tax_rate: new Prisma.Decimal(i.tax_rate || 0), // ✅ Fixed
//             tax_amount: new Prisma.Decimal(i.tax_amount || 0), // ✅ Fixed
//           })),
//         });
//       }

//       return voucher;
//     });

//     res.json({ success: true, message: "Voucher updated successfully", data: updated });
//   } catch (error) {
//     console.error("Update Voucher Error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


export const updateVoucher = async (req, res) => {
  const { id } = req.params;
  const {
    company_id,
    voucher_type,
    voucher_number,
    manual_voucher_no,
    date,
    from_name,
    from_email,
    from_phone,
    from_address,
    to_name,
    from_account,
    to_account,
    customer_id,
    vendor_id,
    notes,
    transfer_amount,
    status,
    items,
  } = req.body;

  // 🧩 Parse items safely, outside the transaction so it can be used later
  let parsedItems = [];
  if (items) parsedItems = typeof items === "string" ? JSON.parse(items) : items;

  try {
    const updatedVoucher = await prisma.$transaction(async (tx) => {
      // 🧾 Find existing voucher
      const existingVoucher = await tx.vouchers.findUnique({
        where: { id: Number(id) },
      });

      if (!existingVoucher) throw new Error("Voucher not found");

      // 🖼️ Upload new logo and signature if provided
      let logoUrl = existingVoucher.logo_url;
      let signatureUrl = existingVoucher.signature_url;

      // ✅ Handle logo update
      if (req.files?.logo?.[0]) {
        if (existingVoucher.logo_url) {
          const publicId = existingVoucher.logo_url.split("/").pop().split(".")[0];
          await deleteFromCloudinary(`vouchers/logo/${publicId}`);
        }
        logoUrl = await uploadToCloudinary(req.files.logo[0].buffer, "vouchers/logo");
      }

      // ✅ Handle signature update
      if (req.files?.signature?.[0]) {
        if (existingVoucher.signature_url) {
          const publicId = existingVoucher.signature_url.split("/").pop().split(".")[0];
          await deleteFromCloudinary(`vouchers/signature/${publicId}`);
        }
        signatureUrl = await uploadToCloudinary(req.files.signature[0].buffer, "vouchers/signature");
      }

      // ✅ Update voucher main data
      const voucher = await tx.vouchers.update({
        where: { id: Number(id) },
        data: {
          company_id: Number(company_id),
          voucher_type,
          voucher_number,
          manual_voucher_no,
          date: new Date(date),
          from_name,
          from_email,
          from_phone,
          from_address,
          to_name,
          from_account: from_account ? Number(from_account) : null,
          to_account: to_account ? Number(to_account) : null,
          customer_id: customer_id ? Number(customer_id) : null,
          vendor_id: vendor_id ? Number(vendor_id) : null,
          notes,
          transfer_amount: transfer_amount
            ? new Prisma.Decimal(transfer_amount)
            : null,
          status: status || "Pending",
          logo_url: logoUrl,
          signature_url: signatureUrl,
          updated_at: new Date(),
        },
      });

      return voucher;
    });

    // 🧾 Separate deletion of voucher items from transaction
    await prisma.voucher_items.deleteMany({ where: { voucher_id: Number(id) } });

    // 🧾 Insert new voucher items
    if (parsedItems.length > 0) {
      await prisma.voucher_items.createMany({
        data: parsedItems.map((i) => ({
          voucher_id: Number(id),
          item_name: i.item_name,
          description: i.description || null,
          hsn_code: i.hsn_code || null,
          quantity: new Prisma.Decimal(i.quantity || 0),
          rate: new Prisma.Decimal(i.rate || 0),
          amount: new Prisma.Decimal(i.amount || 0),
          tax_type: i.tax_type || "None",
          tax_rate: new Prisma.Decimal(i.tax_rate || 0),
          tax_amount: new Prisma.Decimal(i.tax_amount || 0),
        })),
      });
    }

    // 📎 Handle new attachments (photos/references)
    const handleUploads = async (type, voucherId) => {
      const uploadedFiles = [];
      const files = req.files?.[type] || [];
      for (const file of files) {
        const url = await uploadToCloudinary(file.buffer, `vouchers/${type}`);
        uploadedFiles.push({
          voucher_id: voucherId,
          file_name: file.originalname,
          file_type: file.mimetype,
          file_url: url,
          attachment_type: type,
        });
      }
      if (uploadedFiles.length > 0) {
        await prisma.voucher_attachments.createMany({ data: uploadedFiles });
      }
    };

    await handleUploads("photos", updatedVoucher.id);
    await handleUploads("references", updatedVoucher.id);

    // ✅ Success Response
    res.json({
      success: true,
      message: "Voucher updated successfully",
      data: updatedVoucher,
    });
  } catch (error) {
    console.error("❌ Update Voucher Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/** ===================== DELETE VOUCHER ===================== */
// export const deleteVoucher = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await prisma.vouchers.delete({
//       where: { id: Number(id) },
//     });
//     res.json({ success: true, message: "Voucher deleted successfully" });
//   } catch (error) {
//     console.error("Delete Voucher Error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


export const deleteVoucher = async (req, res) => {
  const { id } = req.params;

  try {
    // 🧾 Fetch voucher details with related attachments
    const voucher = await prisma.vouchers.findUnique({
      where: { id: Number(id) },
      include: {
        voucher_attachments: true,
      },
    });

    if (!voucher) {
      return res.status(404).json({ success: false, message: "Voucher not found" });
    }

    // 🧹 Prepare Cloudinary deletion list
    const cloudinaryFiles = [];

    // Add logo and signature (if exist)
    if (voucher.logo_url) cloudinaryFiles.push(voucher.logo_url);
    if (voucher.signature_url) cloudinaryFiles.push(voucher.signature_url);

    // Add attachments (photos/references)
    for (const attachment of voucher.voucher_attachments) {
      if (attachment.file_url) cloudinaryFiles.push(attachment.file_url);
    }

    // 🧮 Start transaction to delete from DB
    await prisma.$transaction(async (tx) => {
      // Delete related items first
      await tx.voucher_items.deleteMany({ where: { voucher_id: Number(id) } });

      // Delete attachments
      await tx.voucher_attachments.deleteMany({ where: { voucher_id: Number(id) } });

      // Delete main voucher
      await tx.vouchers.delete({ where: { id: Number(id) } });
    });

    // 🗑️ Delete all Cloudinary files (after DB deletion)
    for (const fileUrl of cloudinaryFiles) {
      try {
        const parts = fileUrl.split("/");
        const publicIdWithExt = parts[parts.length - 1];
        const publicId = publicIdWithExt.split(".")[0];
        const folderPath = fileUrl.split("/upload/")[1].split("/")[0];
        await deleteFromCloudinary(`${folderPath}/${publicId}`);
      } catch (err) {
        console.warn("⚠️ Cloudinary delete failed for:", fileUrl, err.message);
      }
    }

    // ✅ Response
    res.json({
      success: true,
      message: "Voucher and related data deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Voucher Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete voucher",
      error: error.message,
    });
  }
};
