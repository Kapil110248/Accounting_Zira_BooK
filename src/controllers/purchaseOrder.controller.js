import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create Purchase Order
export const createPurchaseOrder = async (req, res) => {
  try {
    const {
      company_id,
      company_name,
      company_address,
      company_email,
      company_phone,
      logo_url,
      quotation_from_vendor_name,
      quotation_from_vendor_address,
      quotation_from_vendor_email,
      quotation_from_vendor_phone,
      ref_no,
      Manual_ref_ro,
      quotation_no,
      manual_quo_no,
      quotation_date,
      valid_till,
      due_date,
      subtotal,
      tax,
      discount,
      total,
      bank_name,
      account_no,
      account_holder,
      ifsc_code,
      bank_details,
      notes,
      terms,
      signature_url,
      photo_url,
      attachment_url,
      bill_to_attention_name,
      bill_to_company_name,
      bill_to_company_address,
      bill_to_company_phone,
      bill_to_company_email,
      bill_to_vendor_name,
      bill_to_vendor_address,
      bill_to_vendor_email,
      bill_to_vendor_phone,
      ship_to_attention_name,
      ship_to_company_name,
      ship_to_company_address,
      ship_to_company_phone,
      ship_to_company_email,
      ship_to_vendor_name,
      ship_to_vendor_address,
      ship_to_vendor_email,
      ship_to_vendor_phone,
      payment_made_vendor_name,
      payment_made_vendor_address,
      payment_made_vendor_email,
      payment_made_vendor_phone,
      driver_name,
      driver_phone,
      driver_details,
      amount_paid,
      total_amount,
      payment_status,
      total_bill,
      balance,
      payment_note,
      quotation_status,
      purchase_order_status,
      goods_receipt_status,
      bill_status,
      draft_status,
      PO_no,
      Manual_PO_ref,
      GR_no,
      Manual_GR_no,
      Bill_no,
      Manual_Bill_no,
      Payment_no,
      Manual_payment_no,
      vendor_ref,
      items // Array of items
    } = req.body;

    // Validation
    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required"
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one item is required"
      });
    }

    // Create Purchase Order with Items
    const purchaseOrder = await prisma.purchaseorder.create({
      data: {
        company_id,
        company_name,
        company_address,
        company_email,
        company_phone,
        logo_url,
        quotation_from_vendor_name,
        quotation_from_vendor_address,
        quotation_from_vendor_email,
        quotation_from_vendor_phone,
        ref_no,
        Manual_ref_ro,
        quotation_no,
        manual_quo_no,
        quotation_date: quotation_date ? new Date(quotation_date) : null,
        valid_till: valid_till ? new Date(valid_till) : null,
        due_date: due_date ? new Date(due_date) : null,
        subtotal: parseFloat(subtotal) || 0,
        tax: parseFloat(tax) || 0,
        discount: parseFloat(discount) || 0,
        total: parseFloat(total) || 0,
        bank_name,
        account_no,
        account_holder,
        ifsc_code,
        bank_details,
        notes,
        terms,
        signature_url,
        photo_url,
        attachment_url,
        bill_to_attention_name,
        bill_to_company_name,
        bill_to_company_address,
        bill_to_company_phone,
        bill_to_company_email,
        bill_to_vendor_name,
        bill_to_vendor_address,
        bill_to_vendor_email,
        bill_to_vendor_phone,
        ship_to_attention_name,
        ship_to_company_name,
        ship_to_company_address,
        ship_to_company_phone,
        ship_to_company_email,
        ship_to_vendor_name,
        ship_to_vendor_address,
        ship_to_vendor_email,
        ship_to_vendor_phone,
        payment_made_vendor_name,
        payment_made_vendor_address,
        payment_made_vendor_email,
        payment_made_vendor_phone,
        driver_name,
        driver_phone,
        driver_details,
        amount_paid: parseFloat(amount_paid) || 0,
        total_amount: parseFloat(total_amount) || 0,
        payment_status: payment_status || "Pending",
        total_bill: parseFloat(total_bill) || 0,
        balance: parseFloat(balance) || 0,
        payment_note,
        quotation_status: quotation_status || "Pending",
        purchase_order_status: purchase_order_status || "Pending",
        goods_receipt_status: goods_receipt_status || "Pending",
        bill_status: bill_status || "Pending",
        draft_status: draft_status || "Draft",
        PO_no,
        Manual_PO_ref,
        GR_no,
        Manual_GR_no,
        Bill_no,
        Manual_Bill_no,
        Payment_no,
        Manual_payment_no,
        vendor_ref,
        
        // Create items
        purchaseorderitems: {
          create: items.map(item => ({
            item_name: item.item_name,
            qty: parseFloat(item.qty),
            rate: parseFloat(item.rate),
            tax_percent: parseFloat(item.tax_percent) || 0,
            discount: parseFloat(item.discount) || 0,
            amount: parseFloat(item.amount)
          }))
        }
      },
      include: {
        purchaseorderitems: true
      }
    });

    return res.status(201).json({
      success: true,
      message: "Purchase Order created successfully",
      data: purchaseOrder
    });

  } catch (error) {
    console.error("Create Purchase Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create Purchase Order",
      error: error.message
    });
  }
};

// Get All Purchase Orders with Filters
export const getAllPurchaseOrders = async (req, res) => {
  try {
    const {
      company_id,
      purchase_order_status,
      payment_status,
      quotation_status,
      draft_status,
      start_date,
      end_date,
      page = 1,
      limit = 10
    } = req.query;

    // Build where clause
    const where = {};

    if (company_id) {
      where.company_id = parseInt(company_id);
    }

    if (purchase_order_status) {
      where.purchase_order_status = purchase_order_status;
    }

    if (payment_status) {
      where.payment_status = payment_status;
    }

    if (quotation_status) {
      where.quotation_status = quotation_status;
    }

    if (draft_status) {
      where.draft_status = draft_status;
    }

    if (start_date || end_date) {
      where.quotation_date = {};
      if (start_date) {
        where.quotation_date.gte = new Date(start_date);
      }
      if (end_date) {
        where.quotation_date.lte = new Date(end_date);
      }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch Purchase Orders
    const [purchaseOrders, total] = await Promise.all([
      prisma.purchaseorder.findMany({
        where,
        include: {
          purchaseorderitems: true
        },
        skip,
        take: parseInt(limit),
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.purchaseorder.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      message: "Purchase Orders fetched successfully",
      data: {
        purchaseOrders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error("Get Purchase Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Purchase Orders",
      error: error.message
    });
  }
};

// Get Purchase Order by ID
export const getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const purchaseOrder = await prisma.purchaseorder.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        purchaseorderitems: true
      }
    });

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase Order not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Purchase Order fetched successfully",
      data: purchaseOrder
    });

  } catch (error) {
    console.error("Get Purchase Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Purchase Order",
      error: error.message
    });
  }
};

// Update Purchase Order
export const updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if exists
    const exists = await prisma.purchaseorder.findUnique({
      where: { id: parseInt(id) }
    });

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Purchase Order not found"
      });
    }

    // Separate items from main data
    const { items, ...mainData } = updateData;

    // Update Purchase Order
    const updatedPurchaseOrder = await prisma.purchaseorder.update({
      where: {
        id: parseInt(id)
      },
      data: {
        ...mainData,
        updated_at: new Date(),
        
        // Update items if provided
        ...(items && {
          purchaseorderitems: {
            deleteMany: {},
            create: items.map(item => ({
              item_name: item.item_name,
              qty: parseFloat(item.qty),
              rate: parseFloat(item.rate),
              tax_percent: parseFloat(item.tax_percent) || 0,
              discount: parseFloat(item.discount) || 0,
              amount: parseFloat(item.amount)
            }))
          }
        })
      },
      include: {
        purchaseorderitems: true
      }
    });

    return res.status(200).json({
      success: true,
      message: "Purchase Order updated successfully",
      data: updatedPurchaseOrder
    });

  } catch (error) {
    console.error("Update Purchase Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update Purchase Order",
      error: error.message
    });
  }
};

// Delete Purchase Order
export const deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if exists
    const exists = await prisma.purchaseorder.findUnique({
      where: { id: parseInt(id) }
    });

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Purchase Order not found"
      });
    }

    // Delete (items will be cascade deleted)
    await prisma.purchaseorder.delete({
      where: {
        id: parseInt(id)
      }
    });

    return res.status(200).json({
      success: true,
      message: "Purchase Order deleted successfully"
    });

  } catch (error) {
    console.error("Delete Purchase Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete Purchase Order",
      error: error.message
    });
  }
};

// Update Purchase Order Status
export const updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { purchase_order_status, payment_status, quotation_status, draft_status } = req.body;

    const updateData = {};
    
    if (purchase_order_status) updateData.purchase_order_status = purchase_order_status;
    if (payment_status) updateData.payment_status = payment_status;
    if (quotation_status) updateData.quotation_status = quotation_status;
    if (draft_status) updateData.draft_status = draft_status;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No status field provided"
      });
    }

    const updatedPurchaseOrder = await prisma.purchaseorder.update({
      where: {
        id: parseInt(id)
      },
      data: {
        ...updateData,
        updated_at: new Date()
      }
    });

    return res.status(200).json({
      success: true,
      message: "Purchase Order status updated successfully",
      data: updatedPurchaseOrder
    });

  } catch (error) {
    console.error("Update Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update Purchase Order status",
      error: error.message
    });
  }
};