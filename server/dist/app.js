"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import fs from 'fs';
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const authRoutes_1 = __importDefault(require("./Routes/authRoutes"));
const studentRouter_1 = __importDefault(require("./Routes/studentRouter"));
const jobRouter_1 = __importDefault(require("./Routes/jobRouter"));
const comapanyRouter_1 = __importDefault(require("./Routes/comapanyRouter"));
const cors_1 = __importDefault(require("cors"));
const errorController_1 = __importDefault(require("./Controller/errorController"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
// middleware
if (process.env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(`${__dirname}/public`));
//routes
//mounting the routers
app.use("/api/auth", authRoutes_1.default);
app.use("/api/company", comapanyRouter_1.default);
app.use("/api/student", studentRouter_1.default);
app.use("/api/jobs", jobRouter_1.default);
app.use("/api/applications", authRoutes_1.default);
// app.use("/", (req, res) => {
//   res.status(200).json({
//     message: "Api working successfully",
//   });
// });
//handling error middleware
app.use(errorController_1.default);
exports.default = app;
