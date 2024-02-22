"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.restrictTo = exports.verifyCode = exports.protect = exports.registerAsStudent = exports.registerAsCompany = exports.loginUser = exports.transactionHistory = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const appError_1 = __importDefault(require("./../utils/appError"));
const catchAsync_1 = __importDefault(require("./../utils/catchAsync"));
const db_1 = require("../lib/db");
const mail_1 = __importDefault(require("@sendgrid/mail"));
function createCode() {
    const code = "qwertyuioplkjhgfdsazxcvbnm1234567890";
    let shortUrl = "";
    for (let i = 0; i < 6; i++) {
        shortUrl += code[Math.floor(Math.random() * code.length)];
    }
    return shortUrl;
}
exports.default = createCode;
const signToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id: id, role: role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};
const createAndSendToken = (user, statusCode, res) => {
    const token = signToken(user.id, user.role);
    res.cookie("jwt", token, {
        expires: new Date(Date.now() +
            parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000),
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
exports.transactionHistory = (0, catchAsync_1.default)(async (req, res, next) => {
    let transactions;
    if (req.body.role === "Company") {
        transactions = await db_1.db.transaction.findMany({
            where: {
                companyId: req.body.id,
            },
        });
    }
    if (req.body.role === "Student") {
        transactions = await db_1.db.transaction.findMany({
            where: {
                studentId: req.body.id,
            },
        });
    }
    res.status(200).json({
        status: "success",
        transactions,
    });
});
exports.loginUser = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return next(new appError_1.default("please provide email and password", 400));
        }
        if (role === "Company") {
            const user = await db_1.db.company.findUnique({
                where: { email: email },
            });
            if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
                return next(new appError_1.default("either email or pass is wrong", 400));
            }
            const { password: hashedPassword, ...userWithoutPassword } = user;
            createAndSendToken(userWithoutPassword, 200, res);
        }
        if (role === "Student") {
            const user = await db_1.db.student.findUnique({
                where: { email: email },
            });
            if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
                return next(new appError_1.default("either email or pass is wrong", 400));
            }
            createAndSendToken(user, 200, res);
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            status: "fail",
            error,
        });
    }
});
exports.registerAsCompany = (0, catchAsync_1.default)(async (req, res, next) => {
    const { name, email, password, role } = req.body;
    const existingCompanyByEmail = await db_1.db.company.findUnique({
        where: { email: email },
    });
    const code = await createCode();
    await (0, exports.sendEmail)(email, code);
    if (existingCompanyByEmail) {
        return res.status(409).json({
            status: "fail",
            user: null,
            message: "Company with this email already exist",
        });
    }
    console.log(role);
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const newCompany = await db_1.db.company.create({
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
});
exports.registerAsStudent = (0, catchAsync_1.default)(async (req, res, next) => {
    const { name, email, password } = req.body;
    const existingstudentByEmail = await db_1.db.student.findUnique({
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
    await (0, exports.sendEmail)(email, code);
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const newstudent = await db_1.db.student.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: "Student",
            code,
        },
    });
    createAndSendToken(newstudent, 201, res);
});
exports.protect = (0, catchAsync_1.default)(async (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    console.log("token", token);
    let currentUser;
    const decoded = await jsonwebtoken_1.default.verify(req.cookies.jwts ? req.cookies.jwts : token, process.env.JWT_SECRET);
    if (typeof decoded === "object" && "role" in decoded && "id" in decoded) {
        const role = decoded.role;
        if (role === "Student") {
            currentUser = await db_1.db.student.findUnique({
                where: {
                    id: decoded.id,
                },
            });
        }
        if (role === "Company") {
            currentUser = await db_1.db.company.findUnique({
                where: {
                    id: decoded.id,
                },
            });
        }
        if (currentUser && currentUser.role !== null) {
            req.user = {
                id: currentUser.id,
                role: currentUser.role,
            };
        }
        else {
            throw new appError_1.default("role is undefined", 400);
        }
    }
    // if (currentUser?.role) {
    //   req.user.role = currentUser.role;
    //   req.user.id = currentUser.id;
    // } else {
    //   throw new AppError("role is undefined", 400);
    // }
    next();
});
exports.verifyCode = (0, catchAsync_1.default)(async (req, res, next) => {
    const { code } = req.body;
    if (req.user.role === "Company") {
        const company = await db_1.db.company.findUnique({
            where: {
                id: req.user.id,
            },
            select: {
                code: true,
            },
        });
        if ((company === null || company === void 0 ? void 0 : company.code) === code) {
            res.status(200).json({
                status: "success",
                code,
            });
        }
    }
    if (req.user.role === "Student") {
        const student = await db_1.db.student.findUnique({
            where: {
                id: req.user.id,
            },
            select: {
                code: true,
            },
        });
        if ((student === null || student === void 0 ? void 0 : student.code) === code) {
            res.status(200).json({
                status: "success",
                code,
            });
        }
    }
});
const restrictTo = (...roles) => {
    return async (req, res, next) => {
        var _a;
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        const decoded = await jsonwebtoken_1.default.verify(req.cookies.jwts ? req.cookies.jwts : token, process.env.JWT_SECRET);
        if (typeof decoded === "object" && "id" in decoded) {
            const role = decoded.role;
            if (!roles.includes(role)) {
                return next(new appError_1.default("You do not have permission to perform this action", 403));
            }
        }
        next();
    };
};
exports.restrictTo = restrictTo;
if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SENDGRID_API_KEY environment variable is not set");
}
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
const sendEmail = async (email, code) => {
    const msg = {
        to: email,
        from: "mohdjamikhann@gmail.com",
        subject: "Registration",
        text: `This is your code to register ${code}`,
    };
    try {
        await mail_1.default.send(msg);
    }
    catch (error) {
        console.error(error);
    }
};
exports.sendEmail = sendEmail;
