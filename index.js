require("dotenv").config()

const express = require("express")
const path = require("path")
const port = process.env.PORT || 5000
const line = require("@line/bot-sdk")
const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_SECRET_KEY
}

let middleware = line.middleware(config)

express()
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"))
  .get("/g/", (req, res) => res.json({ message: `Welcome to ${process.env.SERVICE_NAME}` }))
  .post("/hook/", middleware, (req, res) => lineBot(req, res))
  .listen(port, () => console.log(`Listening on ${ port }`))

function lineBot(req, res) {
  res.json({ message: "hook" })
  console.log("pass")
}
