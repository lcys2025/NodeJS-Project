import express from "express";
import User from "../models/User.model.js";

const router = express.Router();

// Store recognized users (in production, use a database)
const recognizedUsers = {
    'chan_tai_man': { name: 'Chan Tai Man' },
    'john_doe': { name: 'John Doe' },
    'jane_smith': { name: 'Jane Smith' },
};

// GET route for the face recognition page
router.get("/", (req, res) => {
    res.render("face");
});

// POST route for face recognition login
router.post("/login", async (req, res) => {
    const { username, confidence } = req.body;
    
    console.log(`Face recognition attempt for: ${username}, confidence: ${confidence}`);
    
    // Validate the user exists
    if (!recognizedUsers[username]) {
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

    const name = recognizedUsers[username].name;
    console.log(`User ${username} recognized with confidence ${confidence}`);
    console.log(`User details:`, recognizedUsers[username]);
    console.log(`Looking up user in database: ${name}`);
    const user = await User.findOne({ name });
    if(!user) {
        return res.json({
            success: false,
            message: 'User not found in database'
        });
    }

    // Successful recognition - create session or JWT
    req.session.user = user;
    
    // Or if using JWT:
    // const token = generateJWT({ username, fullName: recognizedUsers[username].fullName });
    
    console.log(`Successful face login for: ${username}`);
    
    res.json({
        success: true,
        message: 'Face recognition successful',
        user: user,
    });
});

export default router;
