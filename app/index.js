const { Client, Intents } = require("discord.js");
const fetch = require("node-fetch");
require("dotenv/config");

// LINEブロードキャスト通知を送信する関数
async function sendBroadcastMessage(message) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    console.error("LINE_CHANNEL_ACCESS_TOKEN が設定されていません。");
    return;
  }

  try {
    const res = await fetch("https://api.line.me/v2/bot/message/broadcast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ messages: [{ type: "text", text: message }] }),
    });

    const data = await res.json();
    console.log("LINEブロードキャスト APIレスポンス:", data);
  } catch (error) {
    console.error("LINEブロードキャストの送信に失敗:", error);
  }
}

// Discordクライアントの初期化
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.MESSAGE_CONTENT],
});

// Discordボットがログインしたときの処理
client.once("ready", () => {
  console.log(`ログイン完了: ${client.user.tag}`);
});

// メッセージ受信時の処理
client.on("message", async (message) => {
  // WebhookかBotかを区別
  const isWebhook = message.webhookID !== null;

  if (!isWebhook && message.author.bot) return;

  console.log(`メッセージ受信: ${message.content}`);

  // ボットまたはロールがメンションされたかチェック
  const botMentioned = message.mentions.has(client.user) || /<@&\d+>/.test(message.content);

  if (botMentioned) {
    console.log("ボットがメンションされた");

    try {
      await message.reply("メンションを検知しました！");
      console.log("Discordに返信しました");

      // サーバー名とチャンネル名を取得
      const guildName = message.guild ? message.guild.name : "DM";
      const channelName = message.channel ? message.channel.name : "不明なチャンネル";

      // LINE ブロードキャストを送信
      const broadcastMessage = `【${guildName} - #${channelName}】\n重要なメッセージがあります。`;
      await sendBroadcastMessage(broadcastMessage);
    } catch (error) {
      console.error("エラー発生:", error);
    }
  }
});

// Discordボットのログイン
client.login(process.env.DISCORD_TOKEN);


// ボットの常時起動
const express = require('express');
const app = express();

app.get("/", (req, res) => {
  res.send("Bot is running.");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`ウェブサーバーがポート ${port} で起動中`);
});
