import User from "../models/User.model.js";
import bcrypt from "bcrypt";

const initTrainers = async () => {
  const trainers = [
    {
      name: 'Bee Cho',
      email: 'beecho@example.com',
      plan: 'vip',
      role: 'trainer',
      password: await bcrypt.hash('1AMbeecho', 10),
    },
    {
      name: 'Yami Li',
      email: 'yamili@example.com',
      plan: 'premium',
      role: 'trainer',
      password: await bcrypt.hash('1AMyamili', 10),
    },
    {
      name: 'Elvis Lam',
      email: 'elvislam@example.com',
      plan: 'premium',
      role: 'trainer',
      password: await bcrypt.hash('1AMelvislam', 10),
    }
  ];

  for (const trainer of trainers) {
    await User.findOneAndUpdate(
      { email: trainer.email },
      { $setOnInsert: trainer },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );
  }
};

export const initializeDB = async () => {
  try {
    await initTrainers();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
};