import dotenv from "dotenv";
import mongodbConnect from "./db/db.js";

dotenv.config({
  path: "./env",
});

mongodbConnect()
  .then(process.env.PORT, () => {
    app.listen(`Server is running on ${process.env.PORT}`);
  })
  .catch((err) => {
    console.log("database connection failed", err);
  });
