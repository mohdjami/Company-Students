import { registerAsCompany } from "./../Controller/authController";
import express from "express";
import * as authController from "../Controller/authController";
const router = express.Router();

router.route("/company/signup").post(authController.registerAsCompany);
router.route("/student/signup").post(authController.registerAsStudent);

export default router;
