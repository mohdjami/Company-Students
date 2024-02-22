"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllApplications = exports.createApplication = void 0;
const db_1 = require("../lib/db");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
exports.createApplication = (0, catchAsync_1.default)(async (req, res, next) => {
    const { studentId, jobRoleId } = req.body;
    if (!studentId || !jobRoleId)
        res.status(400).send({ error: "Missing fields" });
    const job = await db_1.db.jobRole.findUnique({
        where: {
            id: jobRoleId,
        },
        select: {
            costToApply: true,
            companyId: true,
        },
    });
    const student = await db_1.db.student.findUnique({
        where: {
            id: studentId,
        },
        select: {
            balance: true,
        },
    });
    if ((student === null || student === void 0 ? void 0 : student.balance) <= 0) {
        res.status(401).json({
            status: "fail",
            message: "Not enough balance",
        });
    }
    await db_1.db.student.update({
        where: {
            id: studentId,
        },
        data: {
            balance: Number(student === null || student === void 0 ? void 0 : student.balance) - Number(job === null || job === void 0 ? void 0 : job.costToApply),
        },
    });
    await db_1.db.company.update({
        where: {
            id: job === null || job === void 0 ? void 0 : job.companyId,
        },
        data: {
            balance: (job === null || job === void 0 ? void 0 : job.costToApply) / 2,
        },
    });
    await db_1.db.transaction.createMany({
        data: {
            studentId: studentId,
            companyId: job === null || job === void 0 ? void 0 : job.companyId,
            amount: job === null || job === void 0 ? void 0 : job.costToApply,
            type: "CREDIT",
        },
    });
    const createApplication = await db_1.db.application.create({
        data: {
            studentId,
            jobRoleId,
        },
    });
    res.status(201).json({
        status: "success",
        data: createApplication,
    });
});
exports.getAllApplications = (0, catchAsync_1.default)(async (req, res, next) => {
    const applications = await db_1.db.application.findMany({
        where: {
            studentId: req.user.id,
        },
    });
    res.status(201).json({
        status: "success",
        applications,
    });
});
