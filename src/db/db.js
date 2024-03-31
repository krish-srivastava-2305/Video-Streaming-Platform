import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const DBConnection = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(`Database is hosted at ${connectionInstance.connection.host}`);
    console.log("connected");
  } catch (error) {
    console.error("Error: ", error);
    console.log("error");
    throw error;
  }
};

export default DBConnection;
