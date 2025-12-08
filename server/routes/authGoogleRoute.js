import express from "express";
import { verifyGoogleToken } from '../controllers/authGoogleController.mjs';
const router = express.Router();


router.post("/auth/google/verify", verifyGoogleToken);


export default router;
