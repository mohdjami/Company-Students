import { db } from "../lib/db";
import express, { Request, Response, NextFunction } from "express";
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

const filterObj = (obj: object, ...allowedFields: string[]) => {
  const newObj: any = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = (obj as any)[el];
    }
  });
  return newObj;
};

export const getAllCompanies = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const company = await db.company.findMany({
      where: { active: true, role: "Company" },
      include: {
        jobRoles: true,
      },
    });

    res.status(200).json({
      status: "success",
      results: company.length,
      company,
    });
  }
);

export const getCompanyById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const company = await db.company.findUnique({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({
      status: "success",
      company,
    });
  }
);
export const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.password || req.body.confirmPassword) {
      return next(
        new AppError(
          "this route is not for password updates please use /updatePassword",
          400
        )
      );
    }
    const filteredBody = filterObj(req.body, "name", "email");
    const company = await db.company.update({
      where: { id: req.user.id },
      data: filteredBody,
    });
    res.status(200).json({
      status: "success",
      data: {
        company,
      },
    });
  }
);

export const deleteMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await db.company.update({
      where: { id: req.user.id },
      data: { active: false },
    });
    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);
