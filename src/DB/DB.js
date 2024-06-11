import mongoose from "mongoose";

const DB = () => {
  if (process.env.MONGO_URL) {
    return mongoose.connect(process.env.MONGO_URL);
  } else {
    return new Promise((resolve, reject) => {
      reject("SET MONGO IN .ENV");
    });
  }
};

export default DB;
