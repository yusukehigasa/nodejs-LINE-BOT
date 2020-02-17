const express = require("express")
const path = require("path")
const port = process.env.PORT || 5000

express()
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"))
  .post("/hook/", (req, res) => res.json({ message: "hook" }))
  .listen(port, () => console.log(`Listening on ${ port }`))
