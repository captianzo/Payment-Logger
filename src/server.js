import 'dotenv/config';
import express from 'express';
import { downloadImage } from './telegram.js'
import { extractTransactionData } from './extractor.js';
import { appendTransactionRow } from './sheets.js';

const app = express();
const PORT = process.env.PORT;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

app.use(express.json());

app.post(`/webhook/${TELEGRAM_TOKEN}`, async (req, res) => {
	res.sendStatus(200);

	try {
		const message = req.body.message

		// Handles only if the incoming message request is a image. Ignores the request if text is received.
		if (message && message.photo) {
			const fileId = req.body.message.photo[req.body.message.photo.length - 1].file_id;
			console.log("Photo Received! File ID:", fileId);

			const imageBuffer = await downloadImage(fileId);

			console.log(`Success! Image downloaded. Buffer size: ${imageBuffer.length} bytes`);

			const transactionData = await extractTransactionData(imageBuffer);

			console.log('Extracted Data Recieved from Gemini: ', transactionData);
			console.log('Extraction completed, waiting for new image...\n');

			await appendTransactionRow({
				payeeName: transactionData.receiver_name || "Unknown",
				amount: transactionData.amount,
				date: transactionData.date,
				time: transactionData.time,
				upiTransactionId: transactionData.upiTransactionId,
				source: transactionData.source
			});

		}
	} catch (error) {
		console.error(`Error Processing Webhook:`, error.message);
	}
});

app.listen(PORT, () => {
	console.log(`Gateway is running on PORT ${PORT}`);
});