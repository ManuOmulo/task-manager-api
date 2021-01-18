const express = require("express")
require("./db/mongoose")

const taskRouter = require("./routers/Task");
const userRouter = require("./routers/User")

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

module.exports = app
