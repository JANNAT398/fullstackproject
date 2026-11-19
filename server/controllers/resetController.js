const nodemailer = require("nodemailer");
const User = require('../models/schemaModels');

let pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let resetController = async (req, res) => {
    try {

        let { email, newPassword,confirmPassword } = req.body;

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

        // Find existing user with matching email and password
        let user = await User.findOne({
            email: normalizedEmail,
            newPassword: newPassword,
            confirmPassword:confirmPassword
        });

        if (!user) {
            let emailExists = await User.findOne({
                email: normalizedEmail
            });
        
            if (!emailExists) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }
        
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }
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
                from: '"EcoBazaar" <islamjanat956@gmail.com>',
                to: user.email,
                subject: "New Login Notification - EcoBazaar",
                html: `
                    <h2>Hello ${user.fullname || 'User'}!</h2>
                    <h3>Login Successful!</h3>
                    <p>Your EcoBazaar account has been logged in successfully.</p>
                    <p>If this wasn't you, please secure your account.</p>
                    <p>Thank you for using EcoBazaar!</p>
                    <h3>EcoBazaar Team 💚</h3>
                `
            });
        } catch (emailErr) {
            console.log("Email notification error:", emailErr.message);
        }

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.fullname,
                email: user.email
            }
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