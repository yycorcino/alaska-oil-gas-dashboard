import express = require("express");
const app = express();

// api call to root directory will return 404 Error
app.get("/", (req, res) => {
  res.status(404).json({ message: "Error" });
});

// set api call route; base url: /dashboard
const userRouter = require("./routes/dashboard");
app.use("/dashboard", userRouter);

app.listen(3001);
