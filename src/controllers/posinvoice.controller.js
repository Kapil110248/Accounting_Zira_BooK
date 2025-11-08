import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * 🧾 CREATE POS INVOICE
 */
export const createposinvoice = async (req, res) => {
  try {
    const {
      company_id,
      customer_id,
      tax_id,
      subtotal,
      total,
      payment_status,
      products,
      symbol,
      currency,
    } = req.body;

    if (!company_id || !customer_id || !products?.length) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const invoice = await prisma.$transaction(async (tx) => {
      const newInvoice = await tx.pos_invoices.create({
        data: {
          company_id: Number(company_id),
          customer_id: Number(customer_id),
          tax_id: tax_id ? Number(tax_id) : null,
          subtotal: Number(subtotal),
          total: Number(total),
          payment_status,
          symbol: symbol || null,
          currency: currency || null,
        },
      });

      const invoiceProducts = products.map((item) => ({
        invoice_id: newInvoice.id,
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        price: Number(item.price),
      }));

      await tx.pos_invoice_products.createMany({ data: invoiceProducts });
      return newInvoice;
    });

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("❌ createposinvoice Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create invoice",
      error: error.message,
    });
  }
};

// 📌 Get All Invoices by Company
export const getAllinvoice = async (req, res) => {
  try {
    const { company_id } = req.params;

    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "company_id is required",
      });
    }

    const invoices = await prisma.pos_invoices.findMany({
      where: { company_id: Number(company_id) },
      orderBy: { created_at: "desc" },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                item_name: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name_english: true,
            email: true,
            phone: true,
            address: true, // ✅ Added field
          },
        },
        tax: {
          select: {
            tax_class: true,
            tax_value: true,
          },
        },
      },
    });

    if (invoices.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No invoices found for this company",
      });
    }

    const formattedInvoices = invoices.map((inv) => ({
      ...inv,
      products: inv.products.map((p) => ({
        id: p.id,
        product_id: p.product_id,
        item_name: p.product?.item_name || null,
        quantity: p.quantity,
        price: p.price,
      })),
      tax: inv.tax
        ? {
            tax_class: inv.tax.tax_class,
            tax_value: inv.tax.tax_value,
          }
        : null,
    }));

    return res.status(200).json({
      success: true,
      count: formattedInvoices.length,
      data: formattedInvoices,
    });
  } catch (error) {
    console.error("❌ getAllinvoice Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch invoices",
      error: error.message,
    });
  }
};

// 📌 Get Single Invoice by ID (same structure)
export const getinvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.pos_invoices.findUnique({
      where: { id: Number(id) },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                item_name: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name_english: true,
            email: true,
            phone: true,
            address: true, // ✅ Added field
          },
        },
        tax: {
          select: {
            tax_class: true,
            tax_value: true,
          },
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const formattedInvoice = {
      ...invoice,
      products: invoice.products.map((p) => ({
        id: p.id,
        product_id: p.product_id,
        item_name: p.product?.item_name || null,
        quantity: p.quantity,
        price: p.price,
      })),
      tax: invoice.tax
        ? {
            tax_class: invoice.tax.tax_class,
            tax_value: invoice.tax.tax_value,
          }
        : null,
    };

    return res.status(200).json({
      success: true,
      data: formattedInvoice,
    });
  } catch (error) {
    console.error("❌ getinvoiceById Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get invoice",
      error: error.message,
    });
  }
};

/**
 * ✏️ UPDATE POS INVOICE
 */
export const updateposinvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { subtotal, total, products } = req.body;

    // ✅ Check if invoice exists
    const existingInvoice = await prisma.pos_invoices.findUnique({
      where: { id: Number(id) },
    });

    if (!existingInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // ✅ Transaction — update invoice + products safely
    const updatedInvoice = await prisma.$transaction(async (tx) => {
      // 🧾 1️⃣ Update subtotal & total if provided
      const invoice = await tx.pos_invoices.update({
        where: { id: Number(id) },
        data: {
          subtotal:
            subtotal !== undefined
              ? Number(subtotal)
              : existingInvoice.subtotal,
          total: total !== undefined ? Number(total) : existingInvoice.total,
        },
      });

      // 🛒 2️⃣ Update Products (remove old and add new)
      if (products && Array.isArray(products)) {
        await tx.pos_invoice_products.deleteMany({
          where: { invoice_id: Number(id) },
        });

        const newProducts = products.map((item) => ({
          invoice_id: Number(id),
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
          price: Number(item.price),
        }));

        await tx.pos_invoice_products.createMany({ data: newProducts });
      }

      return invoice;
    });

    return res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: updatedInvoice,
    });
  } catch (error) {
    console.error("❌ updateposinvoice Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update invoice",
      error: error.message,
    });
  }
};

/**
 * 🗑️ DELETE INVOICE
 */
export const deleteinvoice = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete child records first (pos_invoice_products)
    await prisma.pos_invoice_products.deleteMany({
      where: { invoice_id: Number(id) },
    });

    // Delete parent invoice
    const deletedInvoice = await prisma.pos_invoices.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
      data: deletedInvoice,
    });
  } catch (error) {
    console.error("❌ deleteinvoice Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete invoice",
      error: error.message,
    });
  }
};

/**
 * 📊 SUMMARY DASHBOARD
 * → Total sales, total invoices, total tax collected, partial/full counts
 */
export const summarydahboard = async (req, res) => {
  try {
    const { company_id } = req.query;

    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "company_id is required",
      });
    }

    // Fetch all invoices for this company
    const invoices = await prisma.pos_invoices.findMany({
      where: { company_id: Number(company_id) },
    });

    const totalInvoices = invoices.length;
    const totalSales = invoices.reduce((sum, i) => sum + Number(i.total), 0);
    const partialCount = invoices.filter(
      (i) => i.payment_status === "partial"
    ).length;
    const paidCount = invoices.filter(
      (i) => i.payment_status === "paid"
    ).length;
    const unpaidCount = invoices.filter(
      (i) => i.payment_status === "unpaid"
    ).length;

    return res.status(200).json({
      success: true,
      data: {
        totalInvoices,
        totalSales,
        partialCount,
        paidCount,
        unpaidCount,
      },
    });
  } catch (error) {
    console.error("❌ summarydahboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch summary",
      error: error.message,
    });
  }
};
