const express = require("express");
const router = new express.Router();
const User = require("../src/user");
const auth = require("../middleware/auth");

//Creating a new user: POST
router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
  // user
  //   .save()
  //   .then(() => {
  //     res.send(user);
  //   })
  //   .catch(e => {
  //     res.status(400);
  //     res.send(e);
  //   });
});

//Logging in the user

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(500).send();
  }
});

//Loggin out from one session (wiping out only the token in use)
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send(e);
  }
});

//Logging out from all users (waping out all the tokens)
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send(e);
  }
});

//Authenticating the user, first through the middlewere authntication and then displaying the user (authentication through
//token)

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

//Updating a user by id

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowUpdates = ["name", "age", "email", "password"];
  const isValidOperation = updates.every(update =>
    allowUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send("invalid data");
  }
  try {
    const user = await req.user;
    updates.forEach(update => (user[update] = req.body[update]));
    await user.save();
    // // const findAndUpdate = await User.findByIdAndUpdate(
    // //   req.params.id,
    // //   req.body,
    // //   {
    // //     new: true,
    // //     runValidators: true
    // //   }
    // // );
    res.send(user);
  } catch (e) {
    res.status(500).send();
  }
});

//Deleting a user by Id
router.delete("/users/me", auth, async (req, res) => {
  try {
    // const deleteById = await User.findByIdAndDelete(req.user._id);
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
