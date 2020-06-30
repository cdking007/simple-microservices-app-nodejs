const express = require("express");
const { randomBytes } = require("crypto");
const cors = require("cors");
const app = express();
const axios = require("axios");

app.use(express.json());
app.use(cors());

const posts = {};
app.get("/posts", (req, res) => {
  return res.send(posts);
});
app.post("/posts/create", async (req, res) => {
  const id = randomBytes(4).toString("hex");
  const { title } = req.body;
  posts[id] = {
    id,
    title,
  };
  await axios.post("http://event-bus-srv:4005/events", {
    type: "PostCreated",
    data: {
      id,
      title,
    },
  });

  return res.status(201).send(posts[id]);
});
app.post("/events", (req, res) => {
  console.log("Post event request got", req.body.type);
  res.send({});
});

app.listen(4000, () => {
  console.log("working on update");
  console.log("Post service started on port 4000");
});
