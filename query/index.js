const express = require("express");
const cors = require("cors");
const app = express();
const axios = require("axios");

app.use(express.json());
app.use(cors());

const posts = {};

const handleEvents = (type, data) => {
  if (type === "PostCreated") {
    const { id, title } = data;
    posts[id] = { id, title, comments: [] };
  }

  if (type === "CommentCreated") {
    const { id, content, PostId, status } = data;
    // console.log(posts);
    posts[PostId].comments.push({ id, content, status });
    // posts[PostId] = post;
  }
  // console.log(posts);

  if (type === "CommentUpdated") {
    const { id, content, PostId, status } = data;
    const post = posts[PostId];
    const comment = post.comments.find((c) => {
      return c.id === id;
    });
    comment.status = status;
    comment.content = content;
  }
};

app.get("/posts", (req, res) => {
  res.send(posts);
});
app.post("/events", (req, res) => {
  const { type, data } = req.body;
  handleEvents(type, data);
  res.send({});
});

app.listen(4002, async (req, res) => {
  console.log("query bus is running on the port of 4002");
  const resp = await axios.get("http://event-bus-srv:4005/events");

  for (let event of resp.data) {
    console.log("processing event", event.type);
    handleEvents(event.type, event.data);
  }
});
