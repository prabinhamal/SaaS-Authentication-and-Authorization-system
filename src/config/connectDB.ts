import mongoose from "mongoose";
import config from "./config";

const url: string = config.get("mongoDBURL");

const connectDatabase: () => Promise<void> = async () => {
  try {

    // console.log("Mongo Db URL: ",url)
    await mongoose.connect(url);
    console.log("Database connected succesfull...");

    process.on("SIGINT",  async () =>{
        await mongoose.connection.close();
        process.exit(0)
    })

  } catch (error) {
    if (error instanceof Error) {

      console.error("Database connection failed:", error.message);

    } else {
      console.error("Unknown error:", error);
    }
    process.exit(0)
  }
};

export default connectDatabase;