import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const toNumber = (val) => {
  if (val == null) return 0;
  if (typeof val === 'object' && typeof val.toNumber === 'function') {
    return val.toNumber();
  }
  return Number(val);
};

// ✅ Create Service
export const createService = async (req, res) => {
  try {
    const {
      company_id,
      service_name,
      sku,
      description,
      uom,
      price = 0,
      tax_percent = 0,
      allow_in_invoice = "1",
      remarks
    } = req.body;

    if (!service_name) {
      return res.status(400).json({ success: false, message: "Service name is required" });
    }

    const newService = await prisma.services.create({
      data: {
        company_id: company_id ? parseInt(company_id) : null,
        service_name,
        sku: sku || null,
        description: description || null,
        uom: uom || null,
        price: toNumber(price),
        tax_percent: toNumber(tax_percent),
        allow_in_invoice: allow_in_invoice.toString(),
        remarks: remarks || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: { id: newService.id },
    });
  } catch (error) {
    console.error("Error creating service:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create service",
      error: error.message,
    });
  }
};

// ✅ Get All Services (with company name — manually joined)
export const getAllServices = async (req, res) => {
  try {
    // Step 1: Fetch all services
    const services = await prisma.services.findMany({
      orderBy: { id: 'desc' },
    });

    // Step 2: Extract unique company_ids
    const companyIds = [...new Set(services.map(s => s.company_id).filter(id => id !== null))];

    // Step 3: Fetch all relevant companies in one query
    const companiesMap = {};
    if (companyIds.length > 0) {
      const companies = await prisma.companies.findMany({
        where: { id: { in: companyIds } },
        select: { id: true, name: true },
      });
      companies.forEach(c => {
        companiesMap[c.id] = c.name;
      });
    }

    // Step 4: Attach company_name to each service
    const formattedServices = services.map(service => ({
      ...service,
      id: toNumber(service.id),
      price: toNumber(service.price),
      tax_percent: toNumber(service.tax_percent),
      company_name: service.company_id ? companiesMap[service.company_id] || null : null,
    }));

    return res.status(200).json({
      success: true,
      message: "All services fetched successfully",
      data: formattedServices,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch services",
      error: error.message,
    });
  }
};

// ✅ Get Service By ID (with company name — manually)
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Service ID is required" });
    }

    const serviceId = parseInt(id);
    const service = await prisma.services.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    let company_name = null;
    if (service.company_id) {
      const company = await prisma.companies.findUnique({
        where: { id: service.company_id },
        select: { name: true },
      });
      company_name = company?.name || null;
    }

    return res.status(200).json({
      success: true,
      message: "Service fetched successfully",
      data: {
        ...service,
        id: toNumber(service.id),
        price: toNumber(service.price),
        tax_percent: toNumber(service.tax_percent),
        company_name,
      },
    });
  } catch (error) {
    console.error("Error fetching service by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch service",
      error: error.message,
    });
  }
};

// ✅ Get Services By Company ID
export const getServicesByCompanyId = async (req, res) => {
  try {
    const { company_id } = req.params;
    if (!company_id) {
      return res.status(400).json({ success: false, message: "Company ID is required" });
    }

    const companyId = parseInt(company_id);
    const services = await prisma.services.findMany({
      where: { company_id: companyId },
      orderBy: { id: 'desc' },
    });

    const formattedServices = services.map(service => ({
      ...service,
      id: toNumber(service.id),
      price: toNumber(service.price),
      tax_percent: toNumber(service.tax_percent),
    }));

    return res.status(200).json({
      success: true,
      message: "Company services fetched successfully",
      data: formattedServices,
    });
  } catch (error) {
    console.error("Error fetching services by company ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch services by company",
      error: error.message,
    });
  }
};

// ✅ Update Service
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Service ID is required" });
    }

    const serviceId = parseInt(id);
    const existingService = await prisma.services.findUnique({ where: { id: serviceId } });
    if (!existingService) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    const updateData = {};
    if (fields.company_id !== undefined) updateData.company_id = fields.company_id ? parseInt(fields.company_id) : null;
    if (fields.service_name !== undefined) updateData.service_name = fields.service_name;
    if (fields.sku !== undefined) updateData.sku = fields.sku || null;
    if (fields.description !== undefined) updateData.description = fields.description || null;
    if (fields.uom !== undefined) updateData.uom = fields.uom || null;
    if (fields.price !== undefined) updateData.price = toNumber(fields.price);
    if (fields.tax_percent !== undefined) updateData.tax_percent = toNumber(fields.tax_percent);
    if (fields.allow_in_invoice !== undefined) updateData.allow_in_invoice = fields.allow_in_invoice.toString();
    if (fields.remarks !== undefined) updateData.remarks = fields.remarks || null;

    const updatedService = await prisma.services.update({
      where: { id: serviceId },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: {
        id: toNumber(updatedService.id),
        price: toNumber(updatedService.price),
        tax_percent: toNumber(updatedService.tax_percent),
      },
    });
  } catch (error) {
    console.error("Error updating service:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update service",
      error: error.message,
    });
  }
};

// ✅ Delete Service
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Service ID is required" });
    }

    const serviceId = parseInt(id);
    const service = await prisma.services.findUnique({ where: { id: serviceId } });
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    await prisma.services.delete({ where: { id: serviceId } });
    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete service",
      error: error.message,
    });
  }
};