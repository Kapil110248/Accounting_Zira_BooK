// src/controllers/purchaseReturn.controller.js

import prisma from "../config/db.js";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dkqcqrrbp',
  api_key: '418838712271323',
  api_secret: 'p12EKWICdyHWx8LcihuWYqIruWQ'
});

// Utility: Convert to number safely
const toNumber = (val) => {
  if (val == null) return 0;
  if (typeof val === 'object' && typeof val.toNumber === 'function') {
    return val.toNumber();
  }
  return Number(val);
};

// Generate Reference ID (e.g., REF-PR-1001)
const generateReferenceId = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.purchase_return.count({
    where: {
      created_at: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`)
      }
    }
  });
  const paddedCount = String(count + 1).padStart(4, '0');
  return `REF-PR-${paddedCount}`;
};

// Generate Auto Voucher No (e.g., VOU-PR-2025-001)
const generateAutoVoucherNo = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.purchase_return.count({
    where: {
      created_at: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`)
      }
    }
  });
  const paddedCount = String(count + 1).padStart(3, '0');
  return `VOU-PR-${year}-${paddedCount}`;
};

// Generate Return Number (e.g., PR-2025-001)
const generateReturnNumber = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.purchase_return.count({
    where: {
      created_at: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`)
      }
    }
  });
  const paddedCount = String(count + 1).padStart(3, '0');
  return `PR-${year}-${paddedCount}`;
};

// ✅ Create Purchase Return
export const createPurchaseReturn = async (req, res) => {
  try {
    const data = { ...req.body };

    // Validate required fields
    if (!data.company_id) {
      return res.status(400).json({
        success: false,
        message: "company_id is required"
      });
    }

    if (!data.invoice_no && !data.invoice_number) {
      return res.status(400).json({
        success: false,
        message: "invoice_no or invoice_number is required"
      });
    }

    if (!data.return_date && !data.date) {
      return res.status(400).json({
        success: false,
        message: "return_date or date is required"
      });
    }

    if (!data.warehouse_id && !data.warehouse) {
      return res.status(400).json({
        success: false,
        message: "warehouse_id or warehouse is required"
      });
    }

    // Generate auto fields if not provided
    const referenceId = data.reference_id || data.ref_id || await generateReferenceId();
    const autoVoucherNo = data.auto_voucher_no || data.auto_voucher || await generateAutoVoucherNo();
    const returnNumber = data.return_no || data.return_number || await generateReturnNumber();

    // Handle items array
    const items = data.items || data.purchase_return_items || [];
    let parsedItems = [];
    
    if (typeof items === 'string') {
      try {
        parsedItems = JSON.parse(items);
      } catch (e) {
        parsedItems = [];
      }
    } else if (Array.isArray(items)) {
      parsedItems = items;
    }

    // Calculate totals from items if not provided
    let subTotal = toNumber(data.sub_total || data.subtotal || 0);
    let taxTotal = toNumber(data.tax_total || data.tax || 0);
    let discountTotal = toNumber(data.discount_total || data.discount || 0);
    let grandTotal = toNumber(data.grand_total || data.total || data.amount || 0);

    if (parsedItems.length > 0 && subTotal === 0) {
      parsedItems.forEach(item => {
        const qty = toNumber(item.quantity || item.qty || 0);
        const rate = toNumber(item.rate || item.price || 0);
        const taxPercent = toNumber(item.tax_percent || item.tax || 0);
        const discount = toNumber(item.discount || 0);

        const itemSubTotal = qty * rate;
        const itemDiscount = (itemSubTotal * discount) / 100;
        const itemAfterDiscount = itemSubTotal - itemDiscount;
        const itemTax = (itemAfterDiscount * taxPercent) / 100;
        const itemAmount = itemAfterDiscount + itemTax;

        subTotal += itemSubTotal;
        discountTotal += itemDiscount;
        taxTotal += itemTax;
        grandTotal += itemAmount;
      });
    }

    // Create purchase return with nested items
    const createData = {
      company_id: toNumber(data.company_id),
      reference_id: referenceId,
      manual_voucher_no: data.manual_voucher_no || data.manual_voucher || null,
      auto_voucher_no: autoVoucherNo,
      vendor_id: data.vendor_id ? toNumber(data.vendor_id) : null,
      vendor_name: data.vendor_name || data.vendor || null,
      return_no: returnNumber,
      invoice_no: data.invoice_no || data.invoice_number,
      return_date: new Date(data.return_date || data.date),
      return_type: data.return_type || "Purchase Return",
      warehouse_id: toNumber(data.warehouse_id || data.warehouse),
      reason_for_return: data.reason_for_return || data.reason || null,
      
      // Bank Details
      bank_name: data.bank_name || data.bank_details?.bank_name || null,
      account_no: data.account_no || data.account_number || data.bank_details?.account_no || null,
      account_holder: data.account_holder || data.bank_details?.account_holder || null,
      ifsc_code: data.ifsc_code || data.bank_details?.ifsc_code || null,
      
      sub_total: subTotal,
      tax_total: taxTotal,
      discount_total: discountTotal,
      grand_total: grandTotal,
      status: data.status || "pending",
      notes: data.notes || null,
      created_at: new Date(),
      updated_at: new Date(),
      purchase_return_items: parsedItems.length > 0 ? {
        create: parsedItems.map(item => ({
          product_id: item.product_id ? toNumber(item.product_id) : null,
          item_name: item.item_name || item.name || "",
          quantity: toNumber(item.quantity || item.qty || 0),
          rate: toNumber(item.rate || item.price || 0),
          tax_percent: toNumber(item.tax_percent || item.tax || 0),
          discount: toNumber(item.discount || 0),
          amount: toNumber(item.amount) || (toNumber(item.quantity || item.qty || 0) * toNumber(item.rate || item.price))
        }))
      } : undefined
    };

    const newReturn = await prisma.purchase_return.create({
      data: createData,
      include: {
        purchase_return_items: true
      }
    });

    return res.status(201).json({
      success: true,
      message: "Purchase return created successfully",
      data: newReturn
    });
  } catch (error) {
    console.error("Error creating purchase return:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// ✅ Get All Purchase Returns
export const getAllPurchaseReturns = async (req, res) => {
  try {
    const { company_id, status, warehouse, start_date, end_date, return_no, invoice_no, vendor } = req.query;

    const where = {};
    if (company_id) where.company_id = parseInt(company_id);
    if (status) where.status = status;
    if (warehouse) where.warehouse_id = parseInt(warehouse);
    if (vendor) where.vendor_name = { contains: vendor };
    if (return_no) where.return_no = { contains: return_no };
    if (invoice_no) where.invoice_no = { contains: invoice_no };
    if (start_date || end_date) {
      where.return_date = {};
      if (start_date) where.return_date.gte = new Date(start_date);
      if (end_date) where.return_date.lte = new Date(end_date);
    }

    const purchaseReturns = await prisma.purchase_return.findMany({
      where,
      include: {
        purchase_return_items: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      message: "Purchase returns fetched successfully",
      data: purchaseReturns,
      count: purchaseReturns.length
    });
  } catch (error) {
    console.error("Error fetching purchase returns:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// ✅ Get Purchase Return by ID
export const getPurchaseReturnById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID parameter"
      });
    }

    const purchaseReturn = await prisma.purchase_return.findUnique({
      where: { id: parseInt(id) },
      include: {
        purchase_return_items: true
      }
    });

    if (!purchaseReturn) {
      return res.status(404).json({
        success: false,
        message: "Purchase return not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Purchase return fetched successfully",
      data: purchaseReturn
    });
  } catch (error) {
    console.error("Error fetching purchase return:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// ✅ Update Purchase Return
export const updatePurchaseReturn = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID parameter"
      });
    }

    const data = { ...req.body };

    const existing = await prisma.purchase_return.findUnique({
      where: { id: parseInt(id) },
      include: { purchase_return_items: true }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Purchase return not found"
      });
    }

    // Handle items update if provided
    const items = data.items || data.purchase_return_items || [];
    let parsedItems = [];
    
    if (typeof items === 'string') {
      try {
        parsedItems = JSON.parse(items);
      } catch (e) {
        parsedItems = [];
      }
    } else if (Array.isArray(items)) {
      parsedItems = items;
    }

    // Calculate totals if items provided
    let subTotal = toNumber(data.sub_total || existing.sub_total || 0);
    let taxTotal = toNumber(data.tax_total || existing.tax_total || 0);
    let discountTotal = toNumber(data.discount_total || existing.discount_total || 0);
    let grandTotal = toNumber(data.grand_total || existing.grand_total || 0);

    if (parsedItems.length > 0) {
      subTotal = 0;
      taxTotal = 0;
      discountTotal = 0;
      grandTotal = 0;

      parsedItems.forEach(item => {
        const qty = toNumber(item.quantity || item.qty || 0);
        const rate = toNumber(item.rate || item.price || 0);
        const taxPercent = toNumber(item.tax_percent || item.tax || 0);
        const discount = toNumber(item.discount || 0);

        const itemSubTotal = qty * rate;
        const itemDiscount = (itemSubTotal * discount) / 100;
        const itemAfterDiscount = itemSubTotal - itemDiscount;
        const itemTax = (itemAfterDiscount * taxPercent) / 100;
        const itemAmount = itemAfterDiscount + itemTax;

        subTotal += itemSubTotal;
        discountTotal += itemDiscount;
        taxTotal += itemTax;
        grandTotal += itemAmount;
      });
    }

    // Delete existing items if new items provided
    if (parsedItems.length > 0) {
      await prisma.purchase_return_items.deleteMany({
        where: { purchase_return_id: parseInt(id) }
      });
    }

    const updateData = {
      manual_voucher_no: data.manual_voucher_no !== undefined ? data.manual_voucher_no : existing.manual_voucher_no,
      vendor_id: data.vendor_id !== undefined ? (data.vendor_id ? toNumber(data.vendor_id) : null) : existing.vendor_id,
      vendor_name: data.vendor_name !== undefined ? data.vendor_name : existing.vendor_name,
      return_no: data.return_no || existing.return_no,
      invoice_no: data.invoice_no || existing.invoice_no,
      return_date: data.return_date ? new Date(data.return_date) : existing.return_date,
      return_type: data.return_type || existing.return_type,
      warehouse_id: data.warehouse_id ? toNumber(data.warehouse_id) : existing.warehouse_id,
      reason_for_return: data.reason_for_return !== undefined ? data.reason_for_return : existing.reason_for_return,
      
      // Bank Details
      bank_name: data.bank_name !== undefined ? data.bank_name : existing.bank_name,
      account_no: data.account_no !== undefined ? data.account_no : existing.account_no,
      account_holder: data.account_holder !== undefined ? data.account_holder : existing.account_holder,
      ifsc_code: data.ifsc_code !== undefined ? data.ifsc_code : existing.ifsc_code,
      
      sub_total: subTotal,
      tax_total: taxTotal,
      discount_total: discountTotal,
      grand_total: grandTotal,
      status: data.status || existing.status,
      notes: data.notes !== undefined ? data.notes : existing.notes,
      updated_at: new Date(),
      purchase_return_items: parsedItems.length > 0 ? {
        create: parsedItems.map(item => ({
          product_id: item.product_id ? toNumber(item.product_id) : null,
          item_name: item.item_name || item.name || "",
          quantity: toNumber(item.quantity || item.qty || 0),
          rate: toNumber(item.rate || item.price || 0),
          tax_percent: toNumber(item.tax_percent || item.tax || 0),
          discount: toNumber(item.discount || 0),
          amount: toNumber(item.amount) || (toNumber(item.quantity || item.qty || 0) * toNumber(item.rate || item.price))
        }))
      } : undefined
    };

    const updatedReturn = await prisma.purchase_return.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        purchase_return_items: true
      }
    });

    return res.status(200).json({
      success: true,
      message: "Purchase return updated successfully",
      data: updatedReturn
    });
  } catch (error) {
    console.error("Error updating purchase return:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// ✅ Delete Purchase Return
export const deletePurchaseReturn = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID parameter"
      });
    }

    const existing = await prisma.purchase_return.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Purchase return not found"
      });
    }

    await prisma.purchase_return.delete({
      where: { id: parseInt(id) }
    });

    return res.status(200).json({
      success: true,
      message: "Purchase return deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting purchase return:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};