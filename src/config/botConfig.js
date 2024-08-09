const { Telegraf } = require("telegraf");
const bot = new Telegraf(
  "7108436735:7108436735:AAEJP2ArblwFo8mkma4gP863A3XdrpYmj94"
);

bot.start((ctx) => {
  ctx.reply("Welcome to openvino");
});

// bot.on("message", (ctx) => {
//   if (ctx.chat.type === "channel") {
//     const chatId = ctx.chat.id;
//     console.log(`Chat ID: ${chatId}`);
//     ctx.reply(`Este es el Chat ID: ${chatId}`);
//   }
// });

bot.launch();
console.log("Bot está en funcionamiento. Envía un mensaje al canal.");
