import express from "express";
import * as authController from "../Controller/authController";
import * as companyController from "../Controller/companyController";
import * as studentController from "../Controller/studentController";

const router = express.Router();

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("Student"),
    studentController.getAllStudents
  );

router
  .route("/update")
  .get(
    authController.protect,
    authController.restrictTo("Student"),
    studentController.updateMe
  );

router.get("/:id", companyController.getCompanyById);
router
  .route("/delete/:id")
  .delete(authController.protect, studentController.deleteMe);

export default router;
