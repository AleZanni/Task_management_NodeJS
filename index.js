const express = require("express");
require("./mongoose");
const userRouter = require("./routers/router_users");
const taskRouter = require("./routers/router_tasks");
const app = express();
const port = process.env.Port || 3000;
//Using the User and task routes
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log("server is running on port: " + port);
});

const Task = require("./src/task");
const User = require("./src/user");
const main = async () => {
  // const task = await Task.findById("5e41145556431e164274fec7");
  // await task.populate("owner").execPopulate();
  // console.log(task.owner);
  // const user = await User.findById("5e41145556431e164274fec7");
  // await user.populate("tasks").execPopulate();
};

main();
