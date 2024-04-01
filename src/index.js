import dotenv from "dotenv";
import mongodbConnect from "./db/db.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

mongodbConnect()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("database connection failed", err);
  });

mongodbConnect();
