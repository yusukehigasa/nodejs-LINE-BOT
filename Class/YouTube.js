class YouTube {
  hi(req, res) {
    res.json({ message: `Call YouTube::hi()` })
  }

  dialogConfirm(event, client, type, value) {
    console.log("Called dialogConfirm()")

    let yes_str = '{"action":"yes","type":"'+ type +'","value":"'+ value +'"}'
    let no_str = '{"action":"no","type":"'+ type +'","value":"'+ value +'"}'

    return client.replyMessage(event.replyToken, {
      type: "template",
      altText: "YouTube内"+ type +"を検索しますか？",
      template: {
        type: "confirm",
        text: "YouTube内"+ type +"を検索しますか？",
        actions: [
          {type: "postback", label: "はい", data: yes_str},
          {type: "postback", label: "いいえ", data: no_str},
        ]
      }
    })
  }

  dialogResults(event, client, type, value) {
    console.log("Called dialogResults()")

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `YouTubeの ${type}を、キーワード「${value}」で検索した結果一覧です。`
    })
  }
}

module.exports = YouTube
