import express from "express";

import * as lookupController from "./lookup.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { ROLES } from "../../constants/roles.js";
import { lookupItemSchema } from "./lookup.validation.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", lookupController.getAllLookups);

router.get("/groups", lookupController.getLookupGroups);
router.get("/groups/:groupKey/items", lookupController.getLookupGroupItems);

router.post(
  "/groups/:groupKey/items",
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validate(lookupItemSchema),
  lookupController.createLookupGroupItem,
);

router.patch(
  "/groups/:groupKey/items/:id",
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validate(lookupItemSchema),
  lookupController.updateLookupGroupItem,
);

router.delete("/groups/:groupKey/items/:id", authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN), lookupController.deleteLookupGroupItem);

router.get("/departments", lookupController.getDepartments);
router.get("/production-reactors", lookupController.getProductionReactors);

router.get("/blood-types", lookupController.getBloodTypes);
router.get("/countries", lookupController.getCountries);
router.get("/sub-regions", lookupController.getSubRegions);
router.get("/cities", lookupController.getCities);
router.get("/districts", lookupController.getDistricts);
router.get("/tax-offices", lookupController.getTaxOffices);

router.get("/currencies", lookupController.getCurrencies);
router.get("/fault-types", lookupController.getFaultTypes);
router.get("/locations", lookupController.getLocations);
router.get("/machine-types", lookupController.getMachineTypes);

router.get("/payment-terms", lookupController.getPaymentTerms);
router.get("/raw-material-payment-terms", lookupController.getRawMaterialPaymentTerms);

router.get("/places-of-use", lookupController.getPlacesOfUse);
router.get("/production-years", lookupController.getProductionYears);
router.get("/purchased-types", lookupController.getPurchasedTypes);
router.get("/purchase-reasons", lookupController.getPurchaseReasons);
router.get("/reason-failures", lookupController.getReasonFailures);
router.get("/supplier-points", lookupController.getSupplierPoints);
router.get("/tank-farms", lookupController.getTankFarms);
router.get("/tax-ratios", lookupController.getTaxRatios);
router.get("/transports", lookupController.getTransports);

export default router;
