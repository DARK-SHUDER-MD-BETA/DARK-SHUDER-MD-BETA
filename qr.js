const PastebinAPI = require('pastebin-js'),
pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL')
const {makeid} = require('./id');
const QRCode = require('qrcode');
const express = require('express');
const path = require('path');
const fs = require('fs');
let router = express.Router()
const pino = require("pino");
const {
	default: ShanWASocket,
	useMultiFileAuthState,
	jidNormalizedUser,
	Browsers,
	delay,
	makeInMemoryStore,
} = require("@whiskeysockets/baileys");

function removeFile(FilePath) {
	if (!fs.existsSync(FilePath)) return false;
	fs.rmSync(FilePath, {
		recursive: true,
		force: true
	})
};
const {
	readFile
} = require("node:fs/promises")
router.get('/', async (req, res) => {
	const id = makeid();
	async function DARK_SHAN() {
		const {
			state,
			saveCreds
		} = await useMultiFileAuthState(__dirname + '/auth_info_baileys')
		try {
			let shan = ShanWASocket({
				auth: state,
				printQRInTerminal: false,
				logger: pino({
					level: "silent"
				}),
				browser: Browsers.macOS("Desktop"),
			});

			shan.ev.on('creds.update', saveCreds)
			shan.ev.on("connection.update", async (s) => {
				const {
					connection,
					lastDisconnect,
					qr
				} = s;
				if (qr) await res.end(await QRCode.toBuffer(qr));
				if (connection == "open") {
					await delay(5000);
					let data = fs.readFileSync(__dirname + '/auth_info_baileys/creds.json');
					await delay(800);
				   let b64data = Buffer.from(data).toString('base64');
				   let session = await shan.sendMessage(shan.user.id, { text: '' + b64data });
	
				   let DARK_SHAN_MD = `┏┅┉⃝┅┅┅┅⃟┅◂ ◃ ◉ ▹ ▸┅⃟┅┅┅┅⃝┅┅┓

╟ ♤ 𝚃𝙷𝙰𝙽𝙺𝚂 𝙵𝙾𝚁 𝙲𝙷𝙾𝙾𝚂𝙴 𝙺𝙰𝚅𝙸𝚂𝙷𝙰𝙽 ┋𝙼𝙳 


┗┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┛`

  await shan.sendMessage(shan.user.id,{text:DARK_SHAN_MD},{quoted:session})



					await delay(100);
					await shan.ws.close();
					return await removeFile(__dirname + '/auth_info_baileys');
				} else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
					await delay(10000);
					DARK_SHAN();
				}
			});
		} catch (err) {
			if (!res.headersSent) {
				await res.json({
					code: "Service Unavailable"
				});
			}
			console.log(err);
			await removeFile(__dirname + '/auth_info_baileys');
		}
	}
	return await DARK_SHAN()
});
module.exports = router
