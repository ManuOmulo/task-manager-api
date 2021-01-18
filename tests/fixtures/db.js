const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")

const User = require("../../src/models/user")
const Task = require("../../src/models/task")

const user1Id = new mongoose.Types.ObjectId()
const user1 = {
  _id: user1Id,
  name: "Mike",
  email: "mike@example.com",
  password: "mynewpass",
  tokens: [{
    token: jwt.sign({ _id: user1Id}, process.env.JWT_SECRET)
  }]
}

const user2Id = new mongoose.Types.ObjectId()
const user2 = {
  _id: user2Id,
  name: "Andrew",
  email: "andrew@example.com",
  password: "myotherpass",
  tokens: [{
    token: jwt.sign({ _id: user2Id}, process.env.JWT_SECRET)
  }]
}

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: "First task",
  completed: true,
  owner: user1Id
}

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: "Second task",
  completed: false,
  owner: user1Id
}

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: "Third task",
  completed: true,
  owner: user2Id
}

const setUpDatabase = async () => {
  await User.deleteMany()
  await Task.deleteMany()
  await new User(user1).save()
  await new User(user2).save()
  await new Task(taskOne).save()
  await new Task(taskTwo).save()
  await new Task(taskThree).save()
}

module.exports = {
  user1Id,
  user1,
  user2Id,
  user2,
  taskOne,
  taskTwo,
  taskThree,
  setUpDatabase
}