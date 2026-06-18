import fs from "fs";
import path from "path";

const modelsDir = path.join(process.cwd(), "prisma/models");
const outputFile = path.join(process.cwd(), "prisma/schema.prisma");

const order = [
  "auth/user.prisma",
  "auth/permission.prisma",
  "auth/role.prisma",

  "business/maintenance/maintenance.prisma",
  "business/procurement/priceRequest.prisma",
  "business/procurement/purchaseRequest.prisma",
  "business/procurement/purchaseOrder.prisma",
  "business/procurement/rawMaterialReceipt.prisma",
  "business/production/production.prisma",
  "business/utility/meter.prisma",
  "business/utility/reading.prisma",

  "core/base.prisma",

  "lookups/unit.prisma",
  "lookups/bloodType.prisma",
  "lookups/city.prisma",
  "lookups/country.prisma",
  "lookups/currency.prisma",
  "lookups/district.prisma",
  "lookups/faultType.prisma",
  "lookups/location.prisma",
  "lookups/machineType.prisma",
  "lookups/paymentTerm.prisma",
  "lookups/placeOfUse.prisma",
  "lookups/productionYear.prisma",
  "lookups/purchased.prisma",
  "lookups/purchaseReason.prisma",
  "lookups/reasonFailure.prisma",
  "lookups/subRegion.prisma",
  "lookups/supplierPoint.prisma",
  "lookups/tankFarm.prisma",
  "lookups/taxOffice.prisma",
  "lookups/taxRatio.prisma",
  "lookups/transportType.prisma",
  "lookups/utilityMeterType.prisma",
  "lookups/quality/inputControlAppearance.prisma",
  "lookups/quality/qualityAppearance.prisma",
  "lookups/quality/rawMaterialAnalysis.prisma",
  "lookups/quality/rawMaterialCategory.prisma",
  "lookups/quality/rawMaterialType.prisma",

  "masters/equipment.prisma",
  "masters/product.prisma",
  "masters/supplier.prisma",

  "organization/department.prisma",
  "organization/employee.prisma",

  "platform/approval.prisma",
  "platform/assignment.prisma",
  "platform/auditLog.prisma",
  "platform/authEventLog.prisma",
  "platform/document.prisma",

  /*

  "employee.prisma",

  "product.prisma",
  
  "warehouse.prisma",
  "stock.prisma",
  "production.prisma",
  "purchase.prisma",
  "purchaseSupplier.prisma",
  "quality.prisma",
  "sales.prisma",
  "shipment.prisma",
  
  "inventory-adjustment.prisma",
  "transfer.prisma",
  "recall.prisma",
  */
];

let mergedSchema = `// AUTO-GENERATED FILE

// DO NOT EDIT

`;

for (const file of order) {
  const filePath = path.join(modelsDir, file);

  if (!fs.existsSync(filePath)) {
    throw new Error(`${file} not found.`);
  }

  const content = fs.readFileSync(filePath, "utf-8");

  mergedSchema += `// ---- ${file} ----\n`;

  mergedSchema += `${content}\n\n`;
}

fs.writeFileSync(outputFile, mergedSchema);

console.log("Prisma schema merged successfully.");
