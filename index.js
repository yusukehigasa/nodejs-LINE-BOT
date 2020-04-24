require("dotenv").config()

const express = require("express")
const path = require("path")
const port = process.env.PORT || 5000
const line = require("@line/bot-sdk")
const crypto = require("crypto")

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
  .post("/hook/", line.middleware(config), (req, res, next) => lineBot(req, res, next))
  .listen(port, () => console.log(`Listening on ${ port }`))

function lineBot(req, res, next) {
  res.status(200).end()

  console.log("Log ready...")
  console.log(next)
  console.log("Log end.")

  let events = req.body.events

  Promise
    .all(events.map(handleEvent))
    .then((result) => {
      res.send(result)
      return next()
    })
    .catch((result) => {
      return console.log("error: " + result)
    })

  /*
  let signature = crypto
        .createHmac("SHA256", process.env.LINE_SECRET_KEY)
        .update(JSON.stringify(req.body)).digest("base64")

  if (signature === req.headers["x-line-signature"]) {
    let events = req.body.events

    Promise
      .all(events.map(handleEvent))
      .then((result) => {
        res.send(result)
        return next()
      })
      .catch((result) => {
        return console.log("error: " + result)
      })
  } else {
    console.log("Signature Failed!!");
  }
  */

  //res.json({ message: "hook" })
}

//非同期関数として定義
async function handleEvent(event) {
  let pro = await client.getProfile(event.source.userId) //awaitで Promiseが返ってくるかで処理を待機させる施策

  return client.replyMessage(event.replyToken, {
    type: "text",
    text: `${pro.displayName}さん、今「${event.message.text}」って言いました？`
  })
}
