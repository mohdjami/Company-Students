import { db } from "../lib/db";
import { Request, Response, NextFunction } from "express";

import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        role: string;
      };
      session: any;
    }
  }
}

export const getAllJobs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const students = await db.jobRole.findMany({
      where: { active: true, companyId: req.user.id },
    });
    res.status(200).json({
      status: "success",
      results: students.length,
      students,
    });
  }
);

export const createJobRole = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("create job role");
    const { name, minCTC, maxCTC, location, companyId } = req.body;
    if (!name || !minCTC || !maxCTC || !location || !companyId) {
      res.status(404).json({
        status: "fail",
        message: "missing parameters",
      });
    }
    const jobExists = await db.jobRole.findMany({ where: { name, companyId } });
    if (jobExists) {
      res.status(409).json({
        status: "fail",
        message: "job already exists",
      });
    }
    const company = await db.company.findUnique({
      where: {
        id: companyId,
      },
      select: {
        balance: true,
      },
    });
    if (company?.balance! <= 0) {
      res.status(404).json({
        status: "fail",
        message: "oops you don't have enough balance",
      });
    }
    const cost =
      +minCTC.length + +maxCTC.length + +name.length + +location.length;
    const newJob = await db.jobRole.create({
      data: {
        name,
        minCTC: Number(minCTC),
        maxCTC: Number(maxCTC),
        location,
        costToApply: cost,
        companyId,
      },
    });

    res.status(201).json({
      status: "success",
      data: newJob,
    });
  }
);

export const getJobById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Fetch all tasks associated with the student

    const students = await db.jobRole.findMany({
      where: { id: req.params.id, active: true },
    });

    res.status(200).json({
      status: "success",
      results: students.length,
      students,
    });
  }
);

export const deleteJob = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Fetch all tasks associated with the student
    console.log(req.params.id);
    const student = await db.jobRole.update({
      where: { id: req.params.id },
      data: { active: false },
    });
    const students = await db.jobRole.findMany({ where: { active: true } });
    res.status(200).json({
      status: "success",
      students,
    });
  }
);
