const express = require("express")
const Task = require("../models/task")
const auth = require("../middleware/authentication")

const router = new express.Router()

// ********** Creating New Task ************
router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id
  })

  try {
    await task.save()
    res.status(201).send(task)
  } catch (error) {
    res.status(400).send(error)
  }
})

// ********** Reading All Tasks *********
router.get("/tasks", auth, async (req, res) => {
  const match = {}
  const sort = {}

  if (req.query.completed) {
    match.completed = req.query.completed === "true"
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":")
    sort[parts[0]] = (parts[1] === "desc") ? -1 : 1
  }

  try {
    await req.user.populate({
      path: "tasks",
      match: match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort: sort
      }
    }).execPopulate()
    res.send(req.user.tasks)
  } catch {
    res.status(500).send()
  }
})

// ********* Reading One Task ************
router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id

  try {
    const task = await Task.findOne({_id: _id, owner: req.user._id})
    if (!task) {
      return res.status(404).send()
    }
    res.send(task)
  } catch {
    res.status(500).send()
  }
})

// ********** Updating Task *************
router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ["description", "completed"]
  const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidUpdate) {
    return res.status(400).send({Error: "Invalid Update"})
  }

  try {
    const task= await Task.findOne({_id: req.params.id, owner: req.user._id})

    if (!task) {
      return res.status(404).send()
    }

    updates.forEach(update => task[update] = req.body[update])
    await task.save()
    res.send(task)
  } catch (error){
    res.status(400).send(error)
  }
})

// ********** Deleting Task *************
router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
    if (!task) {
      return res.status(404).send()
    }
    res.send(task)
  } catch {
    res.status(500).send()
  }
})

module.exports = router