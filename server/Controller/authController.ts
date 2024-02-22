import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import express, { Request, Response, NextFunction } from "express";
import AppError from "./../utils/appError";
import catchAsync from "./../utils/catchAsync";
import { db } from "../lib/db";
import sgMail from "@sendgrid/mail";

import { JwtPayload } from "jsonwebtoken";
export default function createCode(): any {
  const code = "qwertyuioplkjhgfdsazxcvbnm1234567890";
  let shortUrl = "";
  for (let i = 0; i < 6; i++) {
    shortUrl += code[Math.floor(Math.random() * code.length)];
  }
  return shortUrl;
}

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        role: string;
      };
    }
  }
}
const signToken = (id: string, role: string): string => {
  return jwt.sign({ id: id, role: role }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (
  user: any,
  statusCode: number,
  res: Response
): void => {
  const token = signToken(user.id, user.role);
  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() +
        parseInt(process.env.JWT_COOKIE_EXPIRES_IN!) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  });

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export const transactionHistory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let transactions;
    if (req.body.role === "Company") {
      transactions = await db.transaction.findMany({
        where: {
          companyId: req.body.id,
        },
      });
    }
    if (req.body.role === "Student") {
      transactions = await db.transaction.findMany({
        where: {
          studentId: req.body.id,
        },
      });
    }
    res.status(200).json({
      status: "success",
      transactions,
    });
  }
);
export const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, role } = req.body;
      if (!email || !password || !role) {
        return next(new AppError("please provide email and password", 400));
      }
      if (role === "Company") {
        const user = await db.company.findUnique({
          where: { email: email },
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
          return next(new AppError("either email or pass is wrong", 400));
        }
        const { password: hashedPassword, ...userWithoutPassword } = user;

        createAndSendToken(userWithoutPassword, 200, res);
      }
      if (role === "Student") {
        const user = await db.student.findUnique({
          where: { email: email },
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
          return next(new AppError("either email or pass is wrong", 400));
        }
        createAndSendToken(user, 200, res);
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "fail",
        error,
      });
    }
  }
);

export const registerAsCompany = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, role } = req.body;
    const existingCompanyByEmail = await db.company.findUnique({
      where: { email: email },
    });
    const code = await createCode();
    await sendEmail(email, code);

    if (existingCompanyByEmail) {
      return res.status(409).json({
        status: "fail",
        user: null,
        message: "Company with this email already exist",
      });
    }
    console.log(role);
    const hashedPassword = await bcrypt.hash(password, 10);

    const newCompany = await db.company.create({
      data: {
        name,
        email,
        logo: "",
        password: hashedPassword,
        role: role,
        code,
      },
    });

    createAndSendToken(newCompany, 201, res);
  }
);

export const registerAsStudent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    const existingstudentByEmail = await db.student.findUnique({
      where: { email: email },
    });

    if (existingstudentByEmail) {
      return res.status(409).json({
        status: "fail",
        user: null,
        message: "student with this email already exist",
      });
    }
    const code = await createCode();
    await sendEmail(email, code);
    const hashedPassword = await bcrypt.hash(password, 10);

    const newstudent = await db.student.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "Student",
        code,
      },
    });

    createAndSendToken(newstudent, 201, res);
  }
);

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("token", token);
    let currentUser;
    const decoded = await jwt.verify(
      req.cookies.jwts ? req.cookies.jwts : token,
      process.env.JWT_SECRET!
    );
    if (typeof decoded === "object" && "role" in decoded && "id" in decoded) {
      const role = (decoded as JwtPayload).role;
      if (role === "Student") {
        currentUser = await db.student.findUnique({
          where: {
            id: (decoded as JwtPayload).id,
          },
        });
      }
      if (role === "Company") {
        currentUser = await db.company.findUnique({
          where: {
            id: (decoded as JwtPayload).id,
          },
        });
      }
      if (currentUser && currentUser.role !== null) {
        req.user = {
          id: currentUser.id,
          role: currentUser.role,
        };
      } else {
        throw new AppError("role is undefined", 400);
      }
    }
    // if (currentUser?.role) {
    //   req.user.role = currentUser.role;
    //   req.user.id = currentUser.id;
    // } else {
    //   throw new AppError("role is undefined", 400);
    // }

    next();
  }
);

export const verifyCode = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.body;
    if (req.user.role === "Company") {
      const company = await db.company.findUnique({
        where: {
          id: req.user.id,
        },
        select: {
          code: true,
        },
      });
      if (company?.code === code) {
        res.status(200).json({
          status: "success",
          code,
        });
      }
    }
    if (req.user.role === "Student") {
      const student = await db.student.findUnique({
        where: {
          id: req.user.id,
        },
        select: {
          code: true,
        },
      });
      if (student?.code === code) {
        res.status(200).json({
          status: "success",
          code,
        });
      }
    }
  }
);

export const restrictTo = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = await jwt.verify(
      req.cookies.jwts ? req.cookies.jwts : token,
      process.env.JWT_SECRET!
    );
    if (typeof decoded === "object" && "id" in decoded) {
      const role = decoded.role;
      if (!roles.includes(role)) {
        return next(
          new AppError("You do not have permission to perform this action", 403)
        );
      }
    }

    next();
  };
};

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable is not set");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async (email: string, code: string) => {
  const msg = {
    to: email,
    from: "mohdjamikhann@gmail.com",
    subject: "Registration",
    text: `This is your code to register ${code}`,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error(error);
  }
};
