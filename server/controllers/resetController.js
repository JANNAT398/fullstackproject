const nodemailer = require("nodemailer");
const User = require('../models/schemaModels');

let pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let resetController = async (req, res) => {
    try {

        let { email, newPassword, confirmPassword } = req.body;

        // Check empty fields
        if (!email || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields"
            });
        }

        // Email validation
        if (!pattern.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email"
            });
        }

        let normalizedEmail = email.trim();

        // Find User
        let user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Password Match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password does not match"
            });
        }

        // Update Password
        user.password = newPassword;

        await user.save();

        // Nodemailer Configuration
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
               user:'islamjanat956@gmail.com',
               pass:'zpcsiuhgvoigqkei',
            }
        });

        // Send Email
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: "Password Changed Successfully - EcoBazaar",
                html: `
                    <h2>Hello ${user.fullname || 'User'}!</h2>
                    <h3>Password Changed Successfully!</h3>
                    <p>Your EcoBazaar account password has been changed.</p>
                    <p>If this wasn't you, please secure your account.</p>
                    <h3>EcoBazaar Team 💚</h3>
                `
            });

        } catch (emailErr) {
            console.log("Email error:", emailErr.message);
        }

        // Final Response
        return res.status(200).json({
            success: true,
            message: "Password reset successful"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { resetController };