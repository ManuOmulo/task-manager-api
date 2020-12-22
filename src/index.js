const express = require("express")
require("./db/mongoose")

const taskRouter = require("./routers/Task");
const userRouter = require("./routers/User")

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
  console.log(`Server running on Port ${port}`)
})
