require("dotenv").config()

const express = require("express")
const path = require("path")
const port = process.env.PORT || 5000
const line = require("@line/bot-sdk")
const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_SECRET_KEY
}
const client = new line.Client(config)

express()
  //NOTE: bodyパーサーをlineミドルウェアより前に使うとうまく動作しない
  //      https://line.github.io/line-bot-sdk-nodejs/guide/webhook.html#build-a-webhook-server-with-express
  //.use(express.urlencoded({ extended: true }))
  //.use(express.json())
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"))
  .get("/g/", (req, res) => res.json({ message: `Welcome to ${process.env.SERVICE_NAME}` }))
  .post("/hook/", line.middleware(config), (req, res) => lineBot(req, res))
  .listen(port, () => console.log(`Listening on ${ port }`))

function lineBot(req, res) {
  res.status(200).end()

  let events = req.body.events
  let promises = []

  events.map((val) => {
    promises.push(echoMan(val))
  })

  Promise
    .all(promises)
    .then(console.log("pass"))

  //res.json({ message: "hook" })
}

async function echoMan(val) {
  let pro = await client.getProfile(val.source.userId)

  return client.replyMessage(val.replyToken, {
    type: "text",
    text: `${pro.displayName}さん、今「${val.message.text}」って言いました？`
  })
}
