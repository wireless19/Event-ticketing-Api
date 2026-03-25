import jwt from "jsonwebtoken";
// import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";

export const generateTokenAndSetCookie = (res, userId) => {
	const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});

	res.cookie("token", token, {
		httpOnly: true, // prevent xss(cross site scripting) attacks
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
	});

	return token;
};