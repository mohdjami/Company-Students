import { getCompanyById } from "./companyController";
import { compileFunction } from "vm";
import { db } from "../lib/db";
import catchAsync from "../utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import app from "../app";

export const createApplication = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { studentId, jobRoleId } = req.body;
    if (!studentId || !jobRoleId)
      res.status(400).send({ error: "Missing fields" });
    const job = await db.jobRole.findUnique({
      where: {
        id: jobRoleId,
      },
      select: {
        costToApply: true,
        companyId: true,
      },
    });
    const student = await db.student.findUnique({
      where: {
        id: studentId,
      },
      select: {
        balance: true,
      },
    });
    if (student?.balance! <= 0) {
      res.status(401).json({
        status: "fail",
        message: "Not enough balance",
      });
    }
    await db.student.update({
      where: {
        id: studentId,
      },
      data: {
        balance: Number(student?.balance!) - Number(job?.costToApply!),
      },
    });
    await db.company.update({
      where: {
        id: job?.companyId,
      },
      data: {
        balance: job?.costToApply! / 2,
      },
    });
    await db.transaction.createMany({
      data: {
        studentId: studentId,
        companyId: job?.companyId,
        amount: job?.costToApply!,
        type: "CREDIT",
      },
    });
    const createApplication = await db.application.create({
      data: {
        studentId,
        jobRoleId,
      },
    });
    res.status(201).json({
      status: "success",
      data: createApplication,
    });
  }
);

export const getAllApplications = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const applications = await db.application.findMany({
      where: {
        studentId: req.user.id,
      },
    });
    res.status(201).json({
      status: "success",
      applications,
    });
  }
);
