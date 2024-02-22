import express from "express";
import * as authController from "../Controller/authController";
import * as companyController from "../Controller/companyController";

const router = express.Router();

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("Company"),
    companyController.getAllCompanies
  );

router
  .route("/update")
  .get(
    authController.protect,
    authController.restrictTo("Company"),
    companyController.updateMe
  );

router.get("/:id", companyController.getCompanyById);
router
  .route("/delete/:id")
  .delete(authController.protect, companyController.deleteMe);

export default router;
