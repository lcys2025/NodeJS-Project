import express from "express";
import User from "../models/User.model.js";

const router = express.Router();

// GET route for the face recognition page
router.get("/", (req, res) => {
    res.render("face");
});

// POST route for face recognition login
router.post("/login", async (req, res) => {
    const { username, confidence } = req.body;

    console.log(`Face recognition attempt for: ${username}, confidence: ${confidence}`);

    const documentUser = await User.findOne({
        $and: [
            // Condition 1: Compare a nested field with a variable
            { 'face.lookup.dirname': username },
            // Condition 2: Compare two fields within the same document
            {
                $expr: {
                    $eq: ['$name', '$face.lookup.name']
                }
            }
        ]
    });

    // Validate the user exists
    if (!documentUser) {
        return res.json({
            success: false,
            message: 'User not recognized in system'
        });
    }

    // Validate confidence level (adjust threshold as needed)
    if (confidence < 0.5) {
        return res.json({
            success: false,
            message: 'Recognition confidence too low'
        });
    }
    const user = await User.findOne({ name: documentUser.name });
    if (!user) {
        return res.json({
            success: false,
            message: 'User not found in database'
        });
    }

    // Successful recognition - create session or JWT
    req.session.user = {
        id: user._id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        role: user.role,
        remainingTrainerDays: user.remainingTrainerDays,
    };

    res.json({
        success: true,
        message: 'Face recognition successful',
        user: user,
    });
});

export default router;
