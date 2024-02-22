"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteJob = exports.getJobById = exports.createJobRole = exports.getAllJobs = void 0;
const db_1 = require("../lib/db");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
exports.getAllJobs = (0, catchAsync_1.default)(async (req, res, next) => {
    const students = await db_1.db.jobRole.findMany({
        where: { active: true, companyId: req.user.id },
    });
    res.status(200).json({
        status: "success",
        results: students.length,
        students,
    });
});
exports.createJobRole = (0, catchAsync_1.default)(async (req, res, next) => {
    console.log("create job role");
    const { name, minCTC, maxCTC, location, companyId } = req.body;
    if (!name || !minCTC || !maxCTC || !location || !companyId) {
        res.status(404).json({
            status: "fail",
            message: "missing parameters",
        });
    }
    const jobExists = await db_1.db.jobRole.findMany({ where: { name, companyId } });
    if (jobExists) {
        res.status(409).json({
            status: "fail",
            message: "job already exists",
        });
    }
    const company = await db_1.db.company.findUnique({
        where: {
            id: companyId,
        },
        select: {
            balance: true,
        },
    });
    if ((company === null || company === void 0 ? void 0 : company.balance) <= 0) {
        res.status(404).json({
            status: "fail",
            message: "oops you don't have enough balance",
        });
    }
    const cost = +minCTC.length + +maxCTC.length + +name.length + +location.length;
    const newJob = await db_1.db.jobRole.create({
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
});
exports.getJobById = (0, catchAsync_1.default)(async (req, res, next) => {
    // Fetch all tasks associated with the student
    const students = await db_1.db.jobRole.findMany({
        where: { id: req.params.id, active: true },
    });
    res.status(200).json({
        status: "success",
        results: students.length,
        students,
    });
});
exports.deleteJob = (0, catchAsync_1.default)(async (req, res, next) => {
    // Fetch all tasks associated with the student
    console.log(req.params.id);
    const student = await db_1.db.jobRole.update({
        where: { id: req.params.id },
        data: { active: false },
    });
    const students = await db_1.db.jobRole.findMany({ where: { active: true } });
    res.status(200).json({
        status: "success",
        students,
    });
});
