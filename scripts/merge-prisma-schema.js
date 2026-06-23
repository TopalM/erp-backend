import fs from "fs";
import path from "path";

const modelsDir = path.join(process.cwd(), "prisma/models");
const outputFile = path.join(process.cwd(), "prisma/schema.prisma");

const order = [
  "core/base.prisma",

  "auth/role.prisma",
  "auth/permission.prisma",
  "auth/user.prisma",

  "lookups/bloodType.prisma",
  "lookups/country.prisma",
  "lookups/city.prisma",
  "lookups/district.prisma",
  "lookups/subRegion.prisma",
  "lookups/taxOffice.prisma",
  "lookups/currency.prisma",
  "lookups/unit.prisma",
  "lookups/faultType.prisma",
  "lookups/location.prisma",
  "lookups/machineType.prisma",
  "lookups/paymentTerm.prisma",
  "lookups/placeOfUse.prisma",
  "lookups/productionReactor.prisma",
  "lookups/productionYear.prisma",
  "lookups/purchased.prisma",
  "lookups/purchaseReason.prisma",
  "lookups/reasonFailure.prisma",
  "lookups/supplierPoint.prisma",
  "lookups/tankFarm.prisma",
  "lookups/taxRatio.prisma",
  "lookups/transportType.prisma",
  "lookups/quality/appearance.prisma",
  "lookups/quality/inputControlAppearance.prisma",
  "lookups/quality/rawMaterialAnalysis.prisma",
  "lookups/quality/rawMaterialCategory.prisma",
  "lookups/quality/rawMaterialType.prisma",

  "organization/department.prisma",
  "organization/employee.prisma",

  "masters/equipment.prisma",
  "masters/product.prisma",
  "masters/supplier.prisma",

  "platform/approval.prisma",
  "platform/assignment.prisma",
  "platform/auditLog.prisma",
  "platform/authEventLog.prisma",
  "platform/document.prisma",
];

let mergedSchema = `// AUTO-GENERATED FILE
// DO NOT EDIT

`;

for (const file of order) {
  const filePath = path.join(modelsDir, file);

  if (!fs.existsSync(filePath)) {
    throw new Error(`${file} not found.`);
  }

  const content = fs.readFileSync(filePath, "utf-8").trim();

  mergedSchema += `// ---- ${file} ----\n`;
  mergedSchema += `${content}\n\n`;
}

fs.writeFileSync(outputFile, mergedSchema);

console.log("Prisma schema merged successfully.");
