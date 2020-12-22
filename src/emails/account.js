const sgMail = require("@sendgrid/mail")

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "omuloemmanuel@gmail.com",
    subject: "Thanks for joining in",
    text: `Welcome to the app ${name}. Let me know how u get along with the app.`
  })
}

const sendCancellationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "omuloemmanuel@gmail.com",
    subject: "You have successfully deleted your account",
    text: `Sorry to see you leave ${name}. Hope you enjoyed. feedback on why you left will be highly appreciated`
  })
}

module.exports = {
  sendWelcomeEmail: sendWelcomeEmail,
  sendCancellationEmail: sendCancellationEmail
}