// // src/controllers/salesOrderController.js

// import { PrismaClient } from "@prisma/client";
// import { v2 as cloudinary } from 'cloudinary'; // ✅ Pure ESM import

// const prisma = new PrismaClient();

// // Configure Cloudinary once (use .env in production)
// cloudinary.config({
//   cloud_name: 'dkqcqrrbp',
//   api_key: '418838712271323',
//   api_secret: 'p12EKWICdyHWx8LcihuWYqIruWQ'
// });

// // Utility: Convert to number safely
// const toNumber = (val) => {
//   if (val == null) return 0;
//   if (typeof val === 'object' && typeof val.toNumber === 'function') {
//     return val.toNumber();
//   }
//   return Number(val);
// };

// // 🖼 Cloudinary Upload Helper
// const uploadToCloudinary = async (base64Data, folder = "sales_orders") => {
//   try {
//     const upload = await cloudinary.uploader.upload(base64Data, {
//       folder,
//       resource_type: "auto",
//     });
//     return upload.secure_url;
//   } catch (error) {
//     console.error("Cloudinary upload failed:", error);
//     return null;
//   }
// };

// // ✅ Save or Update Sales Order
// export const saveOrUpdateSalesOrder = async (req, res) => {
//   try {
//     const { id } = req.body;
//     let data = { ...req.body };

//     // 🖼 Handle Base64 Image Uploads
//     // Note: Postman fields mapped to DB fields
//     const fileFields = [
//       "logo_url",
//       "signature_url",
//       "photo_url",
//       "attach_file_url" // ← this comes from your Postman
//     ];

//     for (const field of fileFields) {
//       if (data[field] && data[field].startsWith("data:")) {
//         const uploadedUrl = await uploadToCloudinary(data[field]);
//         // Map "attach_file_url" → "attachment_url" for DB
//         const dbField = field === "attach_file_url" ? "attachment_url" : field;
//         data[dbField] = uploadedUrl || "";
//       }
//     }

//     // Remove id & original attach_file_url before saving
//     delete data.id;
//     delete data.attach_file_url; // not a DB field

//     // Convert JSON fields
//     const jsonFields = ["items", "bank_details", "driver_details"];
//     jsonFields.forEach((f) => {
//       if (data[f] && typeof data[f] !== "string") {
//         data[f] = JSON.stringify(data[f]);
//       }
//     });

//     // Map Postman fields → Prisma DB fields (if different)
//     const mappedData = {
//       company_id: toNumber(data.company_id),
//       company_name: data.company_name || "",
//       company_address: data.company_address || "",
//       company_email: data.company_email || "",
//       company_phone: data.company_phone || "",
//       logo_url: data.logo_url || "",

//       // Customer info (from Postman)
//       qoutation_to_customer_name: data.customer_address ? (data.bill_to_cust_name || "") : "", // fallback
//       qoutation_to_customer_address: data.customer_address || "",
//       qoutation_to_customer_email: data.customer_email || "",
//       qoutation_to_customer_phone: data.customer_phone || "",

//       ref_no: data.quotation_no || "",
//       Manual_ref_ro: data.manual_qua_no || "",
//       quotation_no: data.quotation_no || "",
//       manual_quo_no: data.manual_qua_no || "",
//       quotation_date: data.quotation_date ? new Date(data.quotation_date) : null,
//       valid_till: data.valid_till ? new Date(data.valid_till) : null,

//       salesorderitems  : data.salesorderitems   || "[]",
//       subtotal: toNumber(data.sub_total), // ← Postman: sub_total
//       tax: toNumber(data.tax),
//       discount: toNumber(data.discount),
//       total: toNumber(data.total),

//       bank_name: data.bank_details?.bank_name || "",
//       account_no: data.bank_details?.account_no || "",
//       account_holder: data.bank_details?.account_holder || "",
//       ifsc_code: data.bank_details?.ifsc_code || "",
//       bank_details: data.bank_details ? JSON.stringify(data.bank_details) : "",

//       notes: data.notes || "",
//       terms: data.terms_and_condition || "",

//       signature_url: data.signature_url || "",
//       photo_url: data.photo_url || "",
//       attachment_url: data.attachment_url || "", // from file upload mapping

//       // Bill To Company
//       bill_to_attention_name: data.bill_to_attention_name || "",
//       bill_to_company_name: data.bill_to_comp_name || "",
//       bill_to_company_address: data.bill_to_comp_address || "",
//       bill_to_company_phone: data.bill_to_comp_phone || "",
//       bill_to_company_email: data.bill_to_comp_email || "",

//       // Bill To Customer
//       bill_to_customer_name: data.bill_to_cust_name || "",
//       bill_to_customer_address: data.bill_to_cust_addr || "",
//       bill_to_customer_email: data.bill_to_cust_email || "",
//       bill_to_customer_phone: data.bill_to_cust_phone || "",

//       // Ship To Company
//       ship_to_attention_name: data.ship_to_attention_name || "",
//       ship_to_company_name: data.ship_to_comp_name || "",
//       ship_to_company_address: data.ship_to_comp_address || "",
//       ship_to_company_phone: data.ship_to_comp_phone || "",
//       ship_to_company_email: data.ship_to_comp_email || "",

//       // Ship To Customer
//       ship_to_customer_name: data.ship_to_cust_name || "",
//       ship_to_customer_address: data.ship_to_cust_addr || "",
//       ship_to_customer_email: data.ship_to_cust_email || "",
//       ship_to_customer_phone: data.ship_to_cust_phone || "",

//       // Payment Received Info
//       payment_received_customer_name: data.received_cust_name || "",
//       payment_received_customer_address: data.received_addr || "",
//       payment_received_customer_email: data.received_email || "",
//       payment_received_customer_phone: data.received_phone || "",

//       // Driver
//       driver_name: data.driver_details?.driver_name || "",
//       driver_phone: data.driver_details?.driver_phone || "",
//       driver_details: data.driver_details ? JSON.stringify(data.driver_details) : "",

//       // Numbers
//       amount_received: toNumber(data.amount_received),
//       total_amount: toNumber(data.total_amount),
//       payment_status: data.payment_status || "Pending",
//       total_invoice: toNumber(data.total_invoice),
//       balance: toNumber(data.balance),
//       payment_note: data.payment_notes || "",

//       // Statuses
//       quotation_status: data.quotation_status || "Pending",
//       sales_order_status: data.sales_status || "Pending",
//       delivery_challan_status: data.delivery_challan_status || "Pending",
//       invoice_status: data.invoice_status || "Pending",
//       draft_status: data.draft_status || "Draft",

//       // Ref Numbers
//       SO_no: data.so_no || "",
//       Manual_SO_ref: data.manual_so || "",
//       Challan_no: data.challan_no || "",
//       Manual_challan_no: data.manual_dc_no || "",
//       Manual_DC_no: data.manual_dc_no || "",
//       invoice_no: data.invoice_no || "",
//       Manual_invoice_no: data.manual_invoice_no || "",
//       Payment_no: data.payment_no || "",
//       Manual_payment_no: data.manual_pym_no || "",
//       customer_ref: data.customer_ref || "",

//       created_at: id ? undefined : new Date(),
//       updated_at: new Date(),
//     };

//     // ✅ CREATE
//     if (!id) {
//       const newOrder = await prisma.salesorder.create({ data: mappedData });
//       return res.status(201).json({
//         success: true,
//         message: "Sales order created successfully",
//         salesOrderId: newOrder.id,
//       });
//     } 
//     // ✏️ UPDATE
//     else {
//       const existing = await prisma.salesorder.findUnique({ where: { id: parseInt(id) } });
//       if (!existing) {
//         return res.status(404).json({ success: false, message: "Sales order not found" });
//       }

//       const updatedOrder = await prisma.salesorder.update({
//         where: { id: parseInt(id) },
//         data: mappedData,
//       });

//       return res.status(200).json({
//         success: true,
//         message: "Sales order updated successfully",
//         salesOrderId: updatedOrder.id,
//       });
//     }
//   } catch (error) {
//     console.error("Error in saveOrUpdateSalesOrder:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };




// src/controllers/salesOrderController.js

import prisma from "../config/db.js";
import { v2 as cloudinary } from 'cloudinary'; // ✅ Pure ESM import

// Configure Cloudinary once (use .env in production)
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

// 🖼 Cloudinary Upload Helper
const uploadToCloudinary = async (base64Data, folder = "sales_orders") => {
  try {
    const upload = await cloudinary.uploader.upload(base64Data, {
      folder,
      resource_type: "auto",
    });
    return upload.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    return null;
  }
};

// ✅ Save or Update Sales Order
export const saveOrUpdateSalesOrder = async (req, res) => {
  try {
    const { id } = req.body;
    let data = { ...req.body };

    // 🖼 Handle Base64 Image Uploads
    // Note: Postman fields mapped to DB fields
    const fileFields = [
      "logo_url",
      "signature_url",
      "photo_url",
      "attach_file_url" // ← this comes from your Postman
    ];

    for (const field of fileFields) {
      if (data[field] && data[field].startsWith("data:")) {
        const uploadedUrl = await uploadToCloudinary(data[field]);
        // Map "attach_file_url" → "attachment_url" for DB
        const dbField = field === "attach_file_url" ? "attachment_url" : field;
        data[dbField] = uploadedUrl || "";
      }
    }

    // Remove id & original attach_file_url before saving
    delete data.id;
    delete data.attach_file_url; // not a DB field

    // Convert JSON fields
    const jsonFields = ["items", "bank_details", "driver_details"];
    jsonFields.forEach((f) => {
      if (data[f] && typeof data[f] !== "string") {
        data[f] = JSON.stringify(data[f]);
      }
    });

    // Map Postman fields → Prisma DB fields (if different)
    const mappedData = {
      company_id: toNumber(data.company_id),
      company_name: data.company_name || "",
      company_address: data.company_address || "",
      company_email: data.company_email || "",
      company_phone: data.company_phone || "",
      logo_url: data.logo_url || "",

      // Customer info (from Postman)
      qoutation_to_customer_name: data.customer_address ? (data.bill_to_cust_name || "") : "", // fallback
      qoutation_to_customer_address: data.customer_address || "",
      qoutation_to_customer_email: data.customer_email || "",
      qoutation_to_customer_phone: data.customer_phone || "",

      ref_no: data.quotation_no || "",
      Manual_ref_ro: data.manual_qua_no || "",
      quotation_no: data.quotation_no || "",
      manual_quo_no: data.manual_qua_no || "",
      quotation_date: data.quotation_date ? new Date(data.quotation_date) : null,
      valid_till: data.valid_till ? new Date(data.valid_till) : null,

      // Items will be handled separately with nested create
      subtotal: toNumber(data.sub_total), // ← Postman: sub_total
      tax: toNumber(data.tax),
      discount: toNumber(data.discount),
      total: toNumber(data.total),

      bank_name: data.bank_details?.bank_name || "",
      account_no: data.bank_details?.account_no || "",
      account_holder: data.bank_details?.account_holder || "",
      ifsc_code: data.bank_details?.ifsc_code || "",

      notes: data.notes || "",
      terms: data.terms_and_condition || "",

      signature_url: data.signature_url || "",
      photo_url: data.photo_url || "",
      attachment_url: data.attachment_url || "", // from file upload mapping

      // Bill To Company
      bill_to_attention_name: data.bill_to_attention_name || "",
      bill_to_company_name: data.bill_to_comp_name || "",
      bill_to_company_address: data.bill_to_comp_address || "",
      bill_to_company_phone: data.bill_to_comp_phone || "",
      bill_to_company_email: data.bill_to_comp_email || "",

      // Bill To Customer
      bill_to_customer_name: data.bill_to_cust_name || "",
      bill_to_customer_address: data.bill_to_cust_addr || "",
      bill_to_customer_email: data.bill_to_cust_email || "",
      bill_to_customer_phone: data.bill_to_cust_phone || "",

      // Ship To Company
      ship_to_attention_name: data.ship_to_attention_name || "",
      ship_to_company_name: data.ship_to_comp_name || "",
      ship_to_company_address: data.ship_to_comp_address || "",
      ship_to_company_phone: data.ship_to_comp_phone || "",
      ship_to_company_email: data.ship_to_comp_email || "",

      // Ship To Customer
      ship_to_customer_name: data.ship_to_cust_name || "",
      ship_to_customer_address: data.ship_to_cust_addr || "",
      ship_to_customer_email: data.ship_to_cust_email || "",
      ship_to_customer_phone: data.ship_to_cust_phone || "",

      // Payment Received Info
      payment_received_customer_name: data.received_cust_name || "",
      payment_received_customer_address: data.received_addr || "",
      payment_received_customer_email: data.received_email || "",
      payment_received_customer_phone: data.received_phone || "",

      // Driver
      driver_name: data.driver_details?.driver_name || "",
      driver_phone: data.driver_details?.driver_phone || "",

      // Numbers
      amount_received: toNumber(data.amount_received),
      total_amount: toNumber(data.total_amount),
      payment_status: data.payment_status || "Pending",
      total_invoice: toNumber(data.total_invoice),
      balance: toNumber(data.balance),
      payment_note: data.payment_notes || "",

      // Statuses
      quotation_status: data.quotation_status || "Pending",
      sales_order_status: data.sales_status || "Pending",
      delivery_challan_status: data.delivery_challan_status || "Pending",
      invoice_status: data.invoice_status || "Pending",
      draft_status: data.draft_status || "Draft",

      // Ref Numbers
      SO_no: data.so_no || "",
      Manual_SO_ref: data.manual_so || "",
      Challan_no: data.challan_no || "",
      Manual_challan_no: data.manual_dc_no || "",
      Manual_DC_no: data.manual_dc_no || "",
      invoice_no: data.invoice_no || "",
      Manual_invoice_no: data.manual_invoice_no || "",
      Payment_no: data.payment_no || "",
      Manual_payment_no: data.manual_pym_no || "",
      customer_ref: data.customer_ref || "",

      created_at: id ? undefined : new Date(),
      updated_at: new Date(),
    };

    // ✅ CREATE
    if (!id) {
      // Handle items array if provided
      const items = data.salesorderitems || data.items || [];
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

      // Create sales order with nested items
      const createData = {
        ...mappedData,
        salesorderitems: parsedItems.length > 0 ? {
          create: parsedItems.map(item => ({
            item_name: item.item_name || item.name || "",
            qty: toNumber(item.qty || item.quantity || 0),
            rate: toNumber(item.rate || 0),
            tax_percent: toNumber(item.tax_percent || item.tax || 0),
            discount: toNumber(item.discount || 0),
            amount: toNumber(item.amount) || (toNumber(item.qty || item.quantity) * toNumber(item.rate))
          }))
        } : undefined
      };

      const newOrder = await prisma.salesorder.create({
        data: createData,
        include: {
          salesorderitems: true
        }
      });

      return res.status(201).json({
        success: true,
        message: "Sales order created successfully",
        data: newOrder
      });
    } 
    // ✏️ UPDATE
    else {
      const existing = await prisma.salesorder.findUnique({ 
        where: { id: parseInt(id) },
        include: { salesorderitems: true }
      });
      
      if (!existing) {
        return res.status(404).json({ success: false, message: "Sales order not found" });
      }

      // Handle items update if provided
      const items = data.salesorderitems || data.items || [];
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

      // Delete existing items if new items provided
      if (parsedItems.length > 0) {
        await prisma.salesorderitems.deleteMany({
          where: { sales_order_id: parseInt(id) }
        });
      }

      const updateData = {
        ...mappedData,
        updated_at: new Date(),
        salesorderitems: parsedItems.length > 0 ? {
          create: parsedItems.map(item => ({
            item_name: item.item_name || item.name || "",
            qty: toNumber(item.qty || item.quantity || 0),
            rate: toNumber(item.rate || 0),
            tax_percent: toNumber(item.tax_percent || item.tax || 0),
            discount: toNumber(item.discount || 0),
            amount: toNumber(item.amount) || (toNumber(item.qty || item.quantity) * toNumber(item.rate))
          }))
        } : undefined
      };

      const updatedOrder = await prisma.salesorder.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          salesorderitems: true
        }
      });

      return res.status(200).json({
        success: true,
        message: "Sales order updated successfully",
        data: updatedOrder
      });
    }
  } catch (error) {
    console.error("Error in saveOrUpdateSalesOrder:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ Create Sales Order (dedicated POST endpoint)
export const createSalesOrder = async (req, res) => {
  try {
    // Use the same logic as saveOrUpdateSalesOrder but without id check
    const data = { ...req.body };
    delete data.id; // Ensure no id is passed

    // 🖼 Handle Base64 Image Uploads
    const fileFields = [
      "logo_url",
      "signature_url",
      "photo_url",
      "attach_file_url"
    ];

    for (const field of fileFields) {
      if (data[field] && data[field].startsWith("data:")) {
        const uploadedUrl = await uploadToCloudinary(data[field]);
        const dbField = field === "attach_file_url" ? "attachment_url" : field;
        data[dbField] = uploadedUrl || "";
      }
    }

    delete data.attach_file_url;

    // Convert JSON fields
    const jsonFields = ["items", "bank_details", "driver_details"];
    jsonFields.forEach((f) => {
      if (data[f] && typeof data[f] !== "string") {
        data[f] = JSON.stringify(data[f]);
      }
    });

    // Map fields → Prisma DB fields
    const mappedData = {
      company_id: toNumber(data.company_id),
      company_name: data.company_name || "",
      company_address: data.company_address || "",
      company_email: data.company_email || "",
      company_phone: data.company_phone || "",
      logo_url: data.logo_url || "",

      // Customer info
      qoutation_to_customer_name: data.qoutation_to_customer_name || data.customer_name || "",
      qoutation_to_customer_address: data.qoutation_to_customer_address || data.customer_address || "",
      qoutation_to_customer_email: data.qoutation_to_customer_email || data.customer_email || "",
      qoutation_to_customer_phone: data.qoutation_to_customer_phone || data.customer_phone || "",

      ref_no: data.ref_no || data.quotation_no || "",
      Manual_ref_ro: data.Manual_ref_ro || data.manual_ref_no || "",
      quotation_no: data.quotation_no || "",
      manual_quo_no: data.manual_quo_no || "",
      quotation_date: data.quotation_date ? new Date(data.quotation_date) : new Date(),
      valid_till: data.valid_till ? new Date(data.valid_till) : null,
      due_date: data.due_date ? new Date(data.due_date) : null,

      subtotal: toNumber(data.subtotal || data.sub_total || 0),
      tax: toNumber(data.tax || data.tax_total || 0),
      discount: toNumber(data.discount || data.discount_total || 0),
      total: toNumber(data.total || data.grand_total || 0),

      bank_name: data.bank_name || data.bank_details?.bank_name || "",
      account_no: data.account_no || data.bank_details?.account_no || "",
      account_holder: data.account_holder || data.bank_details?.account_holder || "",
      ifsc_code: data.ifsc_code || data.bank_details?.ifsc_code || "",

      notes: data.notes || "",
      terms: data.terms || data.terms_conditions || "",

      signature_url: data.signature_url || "",
      photo_url: data.photo_url || "",
      attachment_url: data.attachment_url || "",

      // Bill To Company
      bill_to_attention_name: data.bill_to_attention_name || "",
      bill_to_company_name: data.bill_to_company_name || data.bill_to_comp_name || "",
      bill_to_company_address: data.bill_to_company_address || data.bill_to_comp_address || "",
      bill_to_company_phone: data.bill_to_company_phone || data.bill_to_comp_phone || "",
      bill_to_company_email: data.bill_to_company_email || data.bill_to_comp_email || "",

      // Bill To Customer
      bill_to_customer_name: data.bill_to_customer_name || data.bill_to_cust_name || "",
      bill_to_customer_address: data.bill_to_customer_address || data.bill_to_cust_addr || "",
      bill_to_customer_email: data.bill_to_customer_email || data.bill_to_cust_email || "",
      bill_to_customer_phone: data.bill_to_customer_phone || data.bill_to_cust_phone || "",

      // Ship To Company
      ship_to_attention_name: data.ship_to_attention_name || "",
      ship_to_company_name: data.ship_to_company_name || data.ship_to_comp_name || "",
      ship_to_company_address: data.ship_to_company_address || data.ship_to_comp_address || "",
      ship_to_company_phone: data.ship_to_company_phone || data.ship_to_comp_phone || "",
      ship_to_company_email: data.ship_to_company_email || data.ship_to_comp_email || "",

      // Ship To Customer
      ship_to_customer_name: data.ship_to_customer_name || data.ship_to_cust_name || "",
      ship_to_customer_address: data.ship_to_customer_address || data.ship_to_cust_addr || "",
      ship_to_customer_email: data.ship_to_customer_email || data.ship_to_cust_email || "",
      ship_to_customer_phone: data.ship_to_customer_phone || data.ship_to_cust_phone || "",

      // Payment Received Info
      payment_received_customer_name: data.payment_received_customer_name || data.received_cust_name || "",
      payment_received_customer_address: data.payment_received_customer_address || data.received_addr || "",
      payment_received_customer_email: data.payment_received_customer_email || data.received_email || "",
      payment_received_customer_phone: data.payment_received_customer_phone || data.received_phone || "",

      // Driver
      driver_name: data.driver_name || data.driver_details?.driver_name || "",
      driver_phone: data.driver_phone || data.driver_details?.driver_phone || "",

      // Numbers
      amount_received: toNumber(data.amount_received || 0),
      total_amount: toNumber(data.total_amount || 0),
      payment_status: data.payment_status || "Pending",
      total_invoice: toNumber(data.total_invoice || 0),
      balance: toNumber(data.balance || 0),
      payment_note: data.payment_note || data.payment_notes || "",

      // Statuses
      quotation_status: data.quotation_status || "Pending",
      sales_order_status: data.sales_order_status || data.sales_status || "Pending",
      delivery_challan_status: data.delivery_challan_status || "Pending",
      invoice_status: data.invoice_status || "Pending",
      draft_status: data.draft_status || "Draft",

      // Ref Numbers
      SO_no: data.SO_no || data.so_no || "",
      Manual_SO_ref: data.Manual_SO_ref || data.manual_so || "",
      Challan_no: data.Challan_no || data.challan_no || "",
      Manual_challan_no: data.Manual_challan_no || data.manual_dc_no || "",
      Manual_DC_no: data.Manual_DC_no || data.manual_dc_no || "",
      invoice_no: data.invoice_no || "",
      Manual_invoice_no: data.Manual_invoice_no || data.manual_invoice_no || "",
      Payment_no: data.Payment_no || data.payment_no || "",
      Manual_payment_no: data.Manual_payment_no || data.manual_payment_no || data.manual_pym_no || "",
      customer_ref: data.customer_ref || "",

      created_at: new Date(),
      updated_at: new Date(),
    };

    // Handle items array
    const items = data.salesorderitems || data.items || [];
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

    // Create sales order with nested items
    const createData = {
      ...mappedData,
      salesorderitems: parsedItems.length > 0 ? {
        create: parsedItems.map(item => ({
          item_name: item.item_name || item.name || "",
          qty: toNumber(item.qty || item.quantity || 0),
          rate: toNumber(item.rate || 0),
          tax_percent: toNumber(item.tax_percent || item.tax || 0),
          discount: toNumber(item.discount || 0),
          amount: toNumber(item.amount) || (toNumber(item.qty || item.quantity) * toNumber(item.rate))
        }))
      } : undefined
    };

    const newOrder = await prisma.salesorder.create({
      data: createData,
      include: {
        salesorderitems: true
      }
    });

    return res.status(201).json({
      success: true,
      message: "Sales order created successfully",
      data: newOrder
    });
  } catch (error) {
    console.error("Error creating sales order:", error);
    
    // Check if it's a connection error
    if (error.code === 'P1001' || error.message.includes('Server has closed the connection')) {
      return res.status(503).json({
        success: false,
        message: "Database connection error. Please check your database connection.",
        error: "The database server is not reachable or the connection was closed."
      });
    }
    
    // Check if table doesn't exist
    if (error.code === 'P2021' || error.message.includes("doesn't exist")) {
      return res.status(500).json({
        success: false,
        message: "Database table not found. Please run: npx prisma db push",
        error: "The salesorder table does not exist in the database."
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};