import express from "express";
import { getUserAssessment } from "../controller/assesment.controller";

const assesmentRouter = express.Router();

assesmentRouter.get("/", getUserAssessment);

export default assesmentRouter;
