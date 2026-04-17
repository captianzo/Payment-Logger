import 'dotenv/config';
import express from 'express';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function downloadImage(botToken, fileId, savePath) {
	const fileInfo = await axios.get(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
	// const filePath = fileInfo.data.result.file_path;

	// const downloadUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
	// const response = await Axios({ url: downloadUrl, method: 'GET', responseType: 'stream' });
}

app.use(express.json());

app.post(`/webhook/${TELEGRAM_TOKEN}`, async (req, res) => {
	console.log("Recieved Webhook from Telegram:");
	console.log(JSON.stringify(req.body, null, 2));

	// downloadImage(req.body[1][5].file_id);

	res.sendStatus(200);
});

app.listen(PORT, () => {
	console.log(`Gateway is running on PORT ${PORT}`);
});