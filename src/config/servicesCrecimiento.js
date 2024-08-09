const { default: axios } = require("axios");
const { Telegraf } = require("telegraf");
const bot = new Telegraf("7108436735:AAEJP2ArblwFo8mkma4gP863A3XdrpYmj94");
const QRCode = require("qrcode");

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const websocket = process.env.NEXT_PUBLIC_CRECIMIENTO_WEBSOCKET;
// const webhookURL = process.env.NEXT_PUBLIC_CRECIMIENTO_WEBHOOK;
const webhookURL = process.env.NEXT_PUBLIC_TELEGRAM_WEBHOOK_URL;
const didMethod = "did:quarkid";

console.log(baseUrl);
console.log(websocket);
console.log(webhookURL);

async function generateQRCode(text) {
  try {
    return await QRCode.toDataURL(text);
  } catch (err) {
    console.error(err);
  }
}

async function getIssuanceQR(params) {
  const result = await axios.put(`${baseUrl}/credentialsbbs/wacioob`, params);
  return result.data;
}

async function getPresentationQR(params) {
  const result = await axios.put(
    `${baseUrl}/credentialsbbs/waci/oob/presentation`,
    params
  );
  return result.data;
}

async function interpretWACIFlow(params) {
  const result = await axios.put(`${baseUrl}/credentialsbbs/waci`, params);
  return result.data;
}

async function createDID() {
  const result = await axios.put(`${baseUrl}/dids/quarkid`, {
    websocket,
    webhookURL,
    didMethod,
  });

  return { did: result.data.did };
}
async function sendBotInvite() {
  console.log("Enviando invitita");
  const inviteLink = await bot.telegram.createChatInviteLink("-1002211200512", {
    expire_date: Math.floor(Date.now() / 1000) + 300,
    member_limit: 1,
  });
  console.log(inviteLink);
  return inviteLink;
}

async function startBot() {
  console.log("Start bot");
  bot.start((ctx) => {
    ctx.reply("Welcome to openvino");
  });
  bot.help((ctx) => {
    console.log(ctx.from);
    console.log(ctx.chat);
    console.log(ctx.message);
    console.log(ctx.updateType);

    ctx.reply("Help!");
  });
  bot.settings((ctx) => {
    ctx.reply("Settings!");
  });

  bot.command(["Mycommand", "test"], (ctx) => {
    ctx.reply("Hello World!");
  });

  // bot.hears("vino", (ctx) => {
  //   ctx.reply("OPENVINO!");
  // });

  // bot.on("new_chat_members", async (ctx) => {
  // Llama a la API para obtener el código QR
  bot.hears(["vino", "Vino"], async (ctx) => {
    try {
      const response = await axios.get(
        "https://ferment.openvino.org/api/routes/crecimiento-createPresentationQR?did=did:quarkid:EiDJ0Ygp9evIe_21Cd94zV9pS4vV0dEczLoAQaBN0EgryA"
      );
      const data = response.data;
      console.log(data);

      // Asumiendo que el QR viene como una imagen en base64 o una URL
      const qrUrl = data.oobContentData;
      console.log(qrUrl);
      const qrImage = await generateQRCode(qrUrl);
      // Envía el QR al usuario que se unió
      await ctx.replyWithPhoto(
        { source: Buffer.from(qrImage.split(",")[1], "base64") },
        { caption: "Aquí tienes tu código QR" }
      );
      ctx.reply(`O podés seguir el enlace en QUARKID:`);
      ctx.reply(qrUrl);
    } catch (error) {
      console.error("Error al obtener el QR:", error);
      await ctx.reply(
        "Hubo un error al obtener tu código QR. Por favor, intenta de nuevo más tarde."
      );
    }
  });
  // bot.on("text", (ctx) => {
  //   ctx.reply("You said: " + ctx.message.text);
  // });
  // bot.on("sticker", (ctx) => {
  //   ctx.reply("Enviaste stickers! " + ctx.message);
  // });
  bot.launch();
  console.log("Bot está en funcionamiento. Envía un mensaje al canal.");
}

module.exports = {
  getIssuanceQR,
  getPresentationQR,
  interpretWACIFlow,
  createDID,
  sendBotInvite,
  startBot,
  generateQRCode,
};
