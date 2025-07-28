import express from "express";
import User from "../models/User.js";

const router = express.Router();

/* GET users listing. */

// get all users
router.get("/", async (req, res, next) => {
  try {
    const users = await User.find();
    console.log(users);
    res.json(users);
  } catch (error) {
    res.status(500).send({message: error.message});
  }
});

// login
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // check
    if (!username || !password) {
      return res.status(400).send({message: "Please provide username and password"});
    }

    // find
    const user = await User.findOne({username});
    if (!user) {
      return res.status(401).send({message: "Invalid username or password"});
    }

    // login successfully
    const userResponse = {
      username: user.username,
      email: user.email,
    }

    return res.json({
      message: "Login successfully",
      user: userResponse
    });
  } catch (error) {
    return res.status(500).json({
      message: "failed to login",
      error: error.message
    });
  }
})

router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

export default router;
