
        
import { deleteFromCloudinary, uploadToCloudinary } from "../config/cloudinary.js";
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
      type
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
        credit_period_days: credit_period_days ? parseInt(credit_period_days) : 0,
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
    const {type } = req.query;
    const vendors = await prisma.vendorsCustomer.findMany({
      where: { 
        company_id: parseInt(company_id),
        type, 
      },
      orderBy: { created_at: "desc" },
    });

    res.status(200).json({
      success: true,
      message:  `${type}s fetched successfully`,
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

    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });

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
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    let idCardImageUrl = vendor.id_card_image;
    let anyFileUrl = vendor.any_file;

    // ✅ If new ID card image uploaded → delete old from Cloudinary
    if (req.files?.id_card_image?.[0]) {
      if (vendor.id_card_image) {
        const publicId = vendor.id_card_image.split("/").pop().split(".")[0];
        await deleteFromCloudinary(publicId);
      }

      const uploaded = await uploadToCloudinary(req.files.id_card_image[0].buffer, "vendorsCustomer/id_cards");
      idCardImageUrl = uploaded;
    }

    // ✅ If new file uploaded → delete old from Cloudinary
    if (req.files?.any_file?.[0]) {
      if (vendor.any_file) {
        const publicId = vendor.any_file.split("/").pop().split(".")[0];
        await deleteFromCloudinary(publicId);
      }

      const uploaded = await uploadToCloudinary(req.files.any_file[0].buffer, "vendorsCustomer/files");
      anyFileUrl = uploaded;
    }

    // ✅ Convert numeric fields safely
    const numericData = {
      company_id: data.company_id ? parseInt(data.company_id) : null,
      account_balance: data.account_balance ? parseFloat(data.account_balance) : null,
      credit_period_days: data.credit_period_days ? parseInt(data.credit_period_days) : null,
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
      return res.status(404).json({ success: false, message: "Vendor not found" });
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