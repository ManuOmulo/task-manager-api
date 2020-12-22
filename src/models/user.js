const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const Task = require("./task")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid")
      }
    }
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error("Age cannot be lesser than 0")
      }
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error("Password cannot contain phrase 'password'")
      }
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  avatar: {
    type: Buffer,
  }
}, {
  timestamps: true
})

// *********** Virtual Property (Relationship) ***********
userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner"
})

// ************* Model Methods *****************
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({email : email})
  if (!user) {
    throw new Error("Unable to login")
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new Error("Unable to login")
  }

  return user
}

// ************ Instance Methods ****************
userSchema.methods.generateAuthToken = async function() {
  const user = this
  const token = await jwt.sign({_id: user.id.toString()}, process.env.JWT_SECRET)
  user.tokens = user.tokens.concat({token: token})
  await user.save()
  return token
}

userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens
  delete userObject.__v
  delete userObject.avatar

  return userObject
}

// ********************** Middleware *********************

// #### hashing password before saving ####
userSchema.pre("save", async function (next) {
  const user = this
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8)
  }

  next()
})

// #### delete user tasks when user is removed ####
userSchema.pre("remove", async function (next) {
  const user = this
  await Task.deleteMany({owner: user._id})
  next()
})


const User = mongoose.model('User', userSchema)

module.exports = User
