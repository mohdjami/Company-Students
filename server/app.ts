// import fs from 'fs';
import express, { Express } from "express";
import morgan from "morgan";
import authRouter from "./Routes/authRoutes";
import studentRouter from "./Routes/studentRouter";
import jobRouter from "./Routes/jobRouter";
import companyRouter from "./Routes/comapanyRouter";
import cors from "cors";
import globalErrorHandler from "./Controller/errorController";
import cookieParser from "cookie-parser";

const app: Express = express();

// middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(cors());

app.use(express.json());
app.use(cookieParser());
app.use(express.static(`${__dirname}/public`));

//routes
//mounting the routers
app.use("/api/auth", authRouter);
app.use("/api/company", companyRouter);
app.use("/api/student", studentRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/applications", authRouter);

// app.use("/", (req, res) => {
//   res.status(200).json({
//     message: "Api working successfully",
//   });
// });

//handling error middleware
app.use(globalErrorHandler);

export default app;
