const request = require("supertest")

const app = require("../src/app")
const Task = require("../src/models/task")
const { user1Id, user1, user2, user2Id, taskOne, taskTwo, setUpDatabase, taskThree } = require("./fixtures/db")

beforeEach(setUpDatabase)

test("should create task for user", async () => {
  const response = await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${user1.tokens[0].token}`)
    .send({
      description: "From my test"
    })
    .expect(201)

  const task = await Task.findById(response.body._id)
  expect(task).not.toBeNull()
  expect(task.completed).toBe(false)
})

test("should get all tasks for user one", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${user1.tokens[0].token}`)
    .send()
    .expect(200)

  expect(response.body.length).toEqual(2)
})

test("should refuse user from deleting other user's tasks", async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${user2.tokens[0].token}`)
    .send()
    .expect(404)

  const task = await Task.findById(taskOne._id)
  expect(task).not.toBeNull()
})

test("should delete user task", async () => {
  await request(app)
    .delete(`/tasks/${taskTwo._id}`)
    .set("Authorization", `Bearer ${user1.tokens[0].token}`)
    .send()
    .expect(200)

  const task = await Task.findById(taskTwo._id)
  expect(task).toBeNull()
})

test("should get task by id", async () => {
  const response = await request(app)
    .get(`/tasks/${taskThree._id}`)
    .set("Authorization", `Bearer ${user2.tokens[0].token}`)
    .send()
    .expect(200)

  const task = await Task.findById(taskThree._id)
  expect(response.body).toMatchObject({
    description: task.description,
    completed: task.completed
  })
})

test("fetch completed tasks only", async () => {
  const response = await request(app)
    .get(`/tasks?completed=true`)
    .set("Authorization", `Bearer ${user1.tokens[0].token}`)
    .send()
    .expect(200)

  expect(response.body.length).toEqual(1)
})

test("should fetch page of tasks", async () => {
  const response = await request(app)
    .get("/tasks?limit=3&skip=0")
    .set("Authorization", `Bearer ${user1.tokens[0].token}`)
    .send()
    .expect(200)
})