const express = require("express")
const multer = require("multer")
const sharp = require("sharp")

const User = require("../models/user")
const auth = require("../middleware/authentication")

const { sendWelcomeEmail, sendCancellationEmail} = require("../emails/account")

const router = new express.Router()


// ##### setting up File uploads ####
const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please Upload an Image"))
    }
    cb(undefined, true)
  }
})


// ********** Signing up **************
router.post("/users", async (req, res) => {
  const user = new User(req.body)

  try {
    await user.save()
    sendWelcomeEmail(user.email, user.name)
    const token = await user.generateAuthToken()
    res.status(201).send({user: user, token: token})
  } catch (error){
    res.status(400).send(error)
  }
})

// ********** Logging In *************
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({user: user, token: token})
  } catch {
    res.status(400).send()
  }
})

// ********** Logging Out User **********
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token
    })
    await req.user.save()
    req.status(200).send()
  } catch (e) {
    res.status(500).send()
  }
})

// ********** Logging Out All Accounts ********
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.status(200).send()
  } catch {
    res.status(500).send()
  }
})

// ********** Getting own Profile ***********
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user)
})

// ******** Updating User Profile **************
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ["name", "email", "password", "age"]
  const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidUpdate) {
    return res.status(400).send({Error: "Invalid Update!!"})
  }

  try {
    const user = req.user
    updates.forEach(update => user[update] = req.body[update])
    await user.save()
    res.send(user)
  } catch (error){
    res.status(400).send(error)
  }
})

// *********** Deleting Profile ***************
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove()
    sendCancellationEmail(req.user.email, req.user.name)
    res.send(req.user)
  } catch {
    res.status(500).send()
  }
})

// *********** Uploading a Profile Pic **********
router.post("/users/me/avatar", auth, upload.single("avatar"), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
  req.user.avatar = buffer
  await req.user.save()
  res.send()
}, (error, req, res, next) => {
  res.status(400).send({error: error.message})
})

// ************ Deleting Profile Picture *********
router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.send()
})

// ********** Getting Profile Pic **************
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user || !user.avatar) {
      throw new Error()
    }

    res.set("Content-Type", "image/png")
    res.send(user.avatar)
  } catch {
    res.status(404).send()
  }
})

module.exports = router