import express from "express";
import {
	login,
	logout,
	signup,
	forgotPassword,
	resetPassword,
	// checkAuth,
    changePassword,
    // updateProfile
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
// import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// 🔓 Public routes (no auth)
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// 🔐 Apply middleware to ALL routes below
router.use(verifyToken);
//you can use it like this: authorizeRoles("user", "admin") or authorizeRoles("user")
// router.get("/check-auth", authorizeRoles("user"), checkAuth);
router.post("/change-password", changePassword);
// router.patch("/update-profile/:id", authorizeRoles("admin"), updateProfile);


export default router;