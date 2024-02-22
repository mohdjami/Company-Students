import { getJobById } from "./../Controller/jobController";
import express from "express";
import * as authController from "../Controller/authController";
import * as companyController from "../Controller/companyController";
import * as jobController from "../Controller/jobController";

const router = express.Router();

router
  .route("/postJob")
  .post(authController.protect, jobController.createJobRole);

router.route("/getJobs").get(authController.protect, jobController.getAllJobs);

router.get("/:id", jobController.getJobById);
router
  .route("/delete/:id")
  .delete(authController.protect, jobController.deleteJob);

export default router;
