const nodemailer = require("nodemailer");
const User = require('../models/schemaModels');
const jwt = require('jsonwebtoken');

let pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let loginController = async (req, res) => {
    try {

        let { email, password } = req.body;

        // Check empty fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields"
            });
        }

        // Email validation
        if (!pattern.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email"
            });
        }

        let normalizedEmail = email.trim();

        // Find user
        let user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check password
        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        // Generate Access Token
        const accessToken = jwt.sign(
            { id: user._id },
            process.env.SECRET_KEY,
            {
                expiresIn: "1d"
            }
        );

        // Generate Refresh Token
        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.SECRET_KEY,
            {
                expiresIn: "30d"
            }
        );

        // Nodemailer configuration
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user:'islamjanat956@gmail.com',
                pass:'zpcsiuhgvoigqkei',
             }
        });

        // Send Login Notification
        try {
            await transporter.sendMail({
                from: `"EcoBazaar" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: "New Login Notification - EcoBazaar",
                html: `
                    <h2>Hello ${user.fullname || 'User'}!</h2>
                    <h3>Login Successful!</h3>
                    <p>Your EcoBazaar account has been logged in successfully.</p>
                    <p>If this wasn't you, please secure your account.</p>
                    <h3>EcoBazaar Team 💚</h3>
                `
            });

        } catch (emailErr) {
            console.log("Email notification error:", emailErr.message);
        }

        // Cookie Options
        const option = {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        };

        // Send Response
        return res.status(200)
            .cookie("accessToken", accessToken, {
                ...option,
                maxAge: 1000 * 60 * 60 * 24
            })
            .cookie("refreshToken", refreshToken, {
                ...option,
                maxAge: 1000 * 60 * 60 * 24 * 30
            })
            .json({
                success: true,
                message: "Login successful",
                user: {
                    id: user._id,
                    name: user.fullname,
                    email: user.email
                }
            });

    } catch (error) {

        console.log("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { loginController };