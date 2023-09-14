const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const cron = require("node-cron");
const fs = require("fs");
const app = express();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.use(express.static("./uploads"));

app.post("/", upload.single("picture"), async (req, res) => {
  fs.access("./uploads", (error) => {
    if (error) {
      fs.mkdirSync("./uploads");
    }
  });

  const { buffer, originalname } = req.file;

  const uniqueID = Math.random().toString(36).substring(2, 15);

  const updatedName = originalname.split(".")[0];
  const fileName = `${uniqueID}-${updatedName}.webp`;

  await sharp(buffer)
    .webp({ quality: 100 })
    .toFile("./uploads/" + fileName);

  const link = `${
    process.env.NODE_ENV === "production"
      ? "https://images.arinji.com"
      : "http://localhost:3000"
  }/${fileName}`;

  const task = cron.schedule(
    "0 0 */1 * * *",
    () => {
      fs.unlinkSync(`./uploads/${fileName}`);
      task.stop();
    },
    {
      scheduled: true,
    }
  );

  return res.json({ link });
});
const port = 5000;

app.listen(port, () => console.log(`App listening on port ${port}!`));
