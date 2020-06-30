const expess = require("express");
const cors = require("cors");
const { randomBytes } = require("crypto");
const axios = require("axios");
const app = expess();

app.use(expess.json());
app.use(cors());
let commentsByUserId = {};

app.get("/posts/:id/comments", (req, res) => {
  return res.send(commentsByUserId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const PostId = req.params.id;
  const content = req.body.content;
  const comments = commentsByUserId[PostId] || [];
  comments.push({ id: commentId, content, status: "pending" });

  commentsByUserId[PostId] = comments;
  await axios.post("http://event-bus-srv:4005/events", {
    type: "CommentCreated",
    data: {
      id: commentId,
      content,
      PostId: PostId,
      status: "pending",
    },
  });

  return res.status(201).send(comments);
});

app.post("/events", async (req, res) => {
  const { type, data } = req.body;
  if (type === "CommentModerated") {
    const { id, PostId, status, content } = data;
    const comments = commentsByUserId[PostId];
    const comment = comments.find((comment) => {
      return comment.id === id;
    });
    comment.status = status;
    await axios.post("http://event-bus-srv:4005/events", {
      type: "CommentUpdated",
      data: {
        id,
        PostId,
        status,
        content,
      },
    });
  }

  res.send({});
});

app.listen(4001, () => {
  console.log("comments service started on port 4001");
});
