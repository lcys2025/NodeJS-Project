import User from "../models/User.model.js";
import bcrypt from "bcrypt";

const initTrainers = async () => {
  const trainers = [
    {
      name: 'John "The Hammer" Smith',
      email: 'john.the.hammer.smith@example.com',
      plan: 'vip',
      role: 'trainer',
      //password: await bcrypt.hash('iamjohnthehammersmith', 10)
      password: 'iamjohnthehammersmith',
    },
    {
      name: 'Sarah "Lightning" Lee',
      email: 'sarah.lightning.lee@example.com',
      plan: 'premium',
      role: 'trainer',
      //password: await bcrypt.hash('iamsarahlightninglee', 10)
      password: 'iamsarahlightninglee',
    },
    {
      name: 'Mike "Flex" Johnson',
      email: 'mike.flex.johnson@example.com',
      plan: 'premium',
      role: 'trainer',
      //password: await bcrypt.hash('iammikeflexjohnson', 10)
      password: 'iammikeflexjohnson',
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