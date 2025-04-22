const OPENAI_API_KEY = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
const CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('CHANNEL_ACCESS_TOKEN');

function doPost(e) {
  const json = JSON.parse(e.postData.contents);
  const replyToken = json.events[0].replyToken;
  const userMessage = json.events[0].message.text;

  // ChatGPTへ送信するメッセージを定義
  const messages = [
    { role: 'system', content: '返答は日本語で行ってください．句読点は次を用いてください．句点："．"，読点："，"．回答は必要な情報のみで，できれば長くなりすぎないようにしてください．' },
    { role: 'user', content: userMessage }
  ];

  // ChatGPTへのリクエスト
  const openaiResponse = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + OPENAI_API_KEY
    },
    payload: JSON.stringify({
      model: 'gpt-4o',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  // ChatGPTのレスポンスを取り出す
  const responseText = JSON.parse(openaiResponse.getContentText()).choices[0].message.content;

  // LINEへ返信する
  const replyMessage = {
    type: 'text',
    text: responseText
  };

  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN
    },
    payload: JSON.stringify({
      replyToken: replyToken,
      messages: [replyMessage]
    })
  });
}
