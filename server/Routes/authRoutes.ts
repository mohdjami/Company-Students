import { registerAsCompany } from "./../Controller/authController";
import express from "express";
import * as authController from "../Controller/authController";
import * as applicationController from "../Controller/applicationController";

const router = express.Router();

router.route("/login").post(authController.loginUser);
router.route("/verify").post(authController.protect, authController.verifyCode);

router.route("/company/signup").post(authController.registerAsCompany);
router.route("/student/signup").post(authController.registerAsStudent);

router
  .route("/transactions")
  .get(authController.protect, authController.transactionHistory);
router
  .route("/applications")
  .get(authController.protect, applicationController.getAllApplications);
export default router;
