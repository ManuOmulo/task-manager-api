const request = require("supertest")

const app = require("../src/app")
const User = require("../src/models/user")
const { user1Id, user1, setUpDatabase } = require("./fixtures/db")

beforeEach(setUpDatabase)

test("should sign up new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Emmanuel",
      email: "emanuelomulo@yahoo.ca",
      password: "pinochio"
    })
    .expect(201)

  // Assert database was changed correctly
  const user = await User.findById(response.body.user._id)
  expect(user).not.toBeNull()

  // Assert about response
  expect(response.body).toMatchObject({
    user: {
      name: "Emmanuel",
      email: "emanuelomulo@yahoo.ca",
    },
    token: user.tokens[0].token
  })

  // Assert password was hashed
  expect(user.password).not.toBe("pinochio")
})

test("should login existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: user1.email,
      password: user1.password
    })
    .expect(200)

  // Assert new token is saved
  const user = await User.findById(user1Id)
  expect(user.tokens[1].token).toEqual(response.body.token)
})

test("should not login non existent user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: "michael@gmail.com",
      password: "lkelwpwpw"
    })
    .expect(400)
})

test("fetch users profile", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${user1.tokens[0].token}`)
    .send()
    .expect(200)
})

test("should not get profile", async () => {
  await request(app)
    .get("/users/me")
    .send()
    .expect(401)
})

test("should delete user account", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${user1.tokens[0].token}`)
    .send()
    .expect(200)

  // Assert user was deleted from Database
  const user = await User.findById(user1Id)
  expect(user).toBeNull()
})

test("should not delete account for unathorized user", async () => {
  await request(app)
    .delete("/users/me")
    .send()
    .expect(401)
})

// test("should upload avatar", async () => {
//   await request(app)
//     .post("/users/me/avatar")
//     .set("Authorization", `Bearer ${user1.tokens[0].token}`)
//     .attach("avatar", "/tests/fixtures/profile-pic.jpg")
//     .expect(200)
// })

test("should update valid user fields", async () => {
  const response = await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${user1.tokens[0].token}`)
    .send({
      name: "Emmanuel"
    })
    .expect(200)

  const user = await User.findById(user1Id)
  expect(user.name).toBe(response.body.name)
})

test("should not update invalid user fields", async () => {
  const response = await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${user1.tokens[0].token}`)
    .send({
      location: "kenya"
    })
    .expect(400)
})
