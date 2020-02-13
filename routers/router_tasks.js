const express = require("express");
const router = new express.Router();
const Task = require("../src/task");
const auth = require("../middleware/auth");

//Creating a new task: POST
router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id
  });
  try {
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
  // task
  //   .save()
  //   .then(task => res.send(task))
  //   .catch(e => {
  //     res.status(400);
  //     res.send(e);
  //   });
});

//Fetching all tasks: GET
// GET /tasks?completed=false || /tasks?completed=true
//GET /tasks?limit=10&skip=0
//GET /tasks?sortBy=createdAt:desc
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  try {
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort
        }
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (e) {
    res.status(404).send(e);
  }
  // Task.find({})
  //   .then(task => res.send(task))
  //   .catch(e => res.status(500).send());
});

//Fetching tasks by ID: GET

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const findTaskById = await Task.findOne({ _id, owner: req.user._id });
    console.log(findTaskById);
    if (!findTaskById) {
      return res.status(404).send();
    }
    res.send(findTaskById);
  } catch (e) {
    res.status(500).send(e);
  }
  // Task.findById(_id)
  //   .then(task => {
  //     if (!task) {
  //       return res.status(404).send();
  //     }
  //     res.send(task);
  //   })
  //   .catch(e => res.status(500).send());
});

//Updating a task
router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowUpdates = ["description", "completed"];
  const isValidOperation = updates.every(update =>
    allowUpdates.includes(update)
  );
  if (!isValidOperation) {
    res.status(404).send("invalid data");
  }
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    updates.forEach(update => {
      console.log(task[update]);
      task[update] = req.body[update];
    });
    await task.save();
    // const findAndUpdate = await Task.findByIdAndUpdate(
    //   req.params.id,
    //   req.body,
    //   { new: true, runValidators: true }
    // );
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

//Deleting a task by id
router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const findTaskAndDelte = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });
    if (!findTaskAndDelte) {
      res.status(404).send();
    }
    res.send(findTaskAndDelte);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
