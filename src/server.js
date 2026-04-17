import 'dotenv/config';
import express from 'express';
import { downloadImage } from './telegram.js'

const app = express();
const PORT = process.env.PORT;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

app.use(express.json());

app.post(`/webhook/${TELEGRAM_TOKEN}`, async (req, res) => {
	res.sendStatus(200);

	try {
		const message = req.body.message

		if (message && message.photo){
			const fileId = req.body.message.photo[req.body.message.photo.length - 1].file_id;
			console.log("Photo Received! File ID:", fileId);

			const imageBuffer = await downloadImage(fileId);

			console.log(`Success! Image downloaded. Buffer size: ${imageBuffer.length} bytes`);
		}
	} catch (error) {
		console.error(`Error Processing Webhook:`, error.message);
	}
});

app.listen(PORT, () => {
	console.log(`Gateway is running on PORT ${PORT}`);
});