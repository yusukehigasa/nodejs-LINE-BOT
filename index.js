require("dotenv").config()

const ClassYouTube = require("./Class/YouTube")
const YouTube = new ClassYouTube()

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
  //.get("/func", (req, res) => YouTube.hi(req, res))
  .post("/hook/", line.middleware(config), (req, res) => lineBot(req, res))
  .listen(port, () => console.log(`Listening on ${ port }`))

function lineBot(req, res) {
  res.status(200).end()
  //console.log(req)

  let signature = crypto
        .createHmac("SHA256", process.env.LINE_SECRET_KEY)
        .update(JSON.stringify(req.body)).digest("base64")

  if (signature === req.headers["x-line-signature"]) {
    let events = req.body.events

    Promise
      .all(events.map(handleEvent))
      .then((result) => console.log("Success!!"))
      .catch((result) => console.log("Error: " + result))
  } else {
    console.log("Signature Failed!!");
  }

  //res.json({ message: "hook" })
}

//非同期関数として定義
async function handleEvent(event) {
  let pro = await client.getProfile(event.source.userId) //awaitで Promiseが返ってくるかで処理を待機させる施策

  console.log(event)
  if (event.message) {
    YouTube.dialogConfirm(event, client, "channel", event.message.text)
  }

  if (event.postback) {
    var json = JSON.parse(event.postback.data)
    console.log(json)

    //NOTE: 投稿された文字列で検索をする処理
    if (json.action == "yes") {
      YouTube.dialogResults(event, client, json.type, json.value)
    }

    //NOTE: 文字列の投稿があったら
    //     「チャネル => プレイリスト => ビデオ」の順で
    //      検索対象を確認する処理
    //      ビデオ検索を断ると一連の作業を中断と判定
    if (json.type == "channel" && json.action == "no") {
      YouTube.dialogConfirm(event, client, "playlist", json.value)
    }
    if (json.type == "playlist" && json.action == "no") {
      YouTube.dialogConfirm(event, client, "video", json.value)
    }
    if (json.type == "video" && json.action == "no") {
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: `YouTubeの検索を中止しました。`
      })
    }
  }

  /*return client.replyMessage(event.replyToken, {
    type: "text",
    text: `${pro.displayName}さん、今「${event.message.text}」って言いました？`
  })*/
}
