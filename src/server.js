import 'dotenv/config';
import express from 'express';
import { downloadImage } from './telegram.js'
import { extractTransactionData } from './extractor.js';
import { appendTransactionRow } from './sheets.js';

const app = express();
const PORT = process.env.PORT;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

app.use(express.json());

const sessions = {};

app.post(`/webhook/${TELEGRAM_TOKEN}`, async (req, res) => {
	res.sendStatus(200);

	try {
		const message = req.body.message

		const chatId = message.chat.id;

		if (!sessions[chatId]) {
			sessions[chatId] = {
				payeeName: null,
				extractedData: null,
				createdAt: Date.now()
			};
		}

		// Handles only if the incoming message request is a TEXT
		if (message && message.text) {
			const currentSession = sessions[chatId];

			const newPayeeName = message.text;
			sessions[chatId].payeeName = newPayeeName;

			if (currentSession.payeeName && currentSession.extractedData) {
				await appendTransactionRow({
					payeeName: currentSession.payeeName || "Unknown",
					amount: currentSession.extractedData.amount,
					date: currentSession.extractedData.date,
					time: currentSession.extractedData.time,
					upiTransactionId: currentSession.extractedData.upiTransactionId,
					source: currentSession.extractedData.source
				});

				console.log('Extraction completed and appended to the Google Sheet, waiting for new image...\n');

				delete sessions[chatId];
			}
			else {
				console.log('Waiting for image...');
			}
		}

		// Handles only if the incoming message request is a IMAGE
		if (message && message.photo) {
			const currentSession = sessions[chatId];

			const fileId = req.body.message.photo[req.body.message.photo.length - 1].file_id;
			console.log("Photo Received! File ID:", fileId);

			const imageBuffer = await downloadImage(fileId);

			console.log(`Success! Image downloaded. Buffer size: ${imageBuffer.length} bytes`);

			const transactionData = await extractTransactionData(imageBuffer);

			currentSession.extractedData = transactionData;

			console.log('Extracted Data Recieved from Gemini: ', transactionData);

			if (currentSession.payeeName && currentSession.extractedData) {
				await appendTransactionRow({
					payeeName: currentSession.payeeName || "Unknown",
					amount: currentSession.extractedData.amount,
					date: currentSession.extractedData.date,
					time: currentSession.extractedData.time,
					upiTransactionId: currentSession.extractedData.upiTransactionId,
					source: currentSession.extractedData.source
				});
				
				console.log('Extraction completed and appended to the Google Sheet, waiting for new image...\n');

				delete sessions[chatId];
			}
			else {
				console.log('Waiting for text...');
			}

		}
	} catch (error) {
		console.error(`Error Processing Webhook:`, error.message);
	}
});

app.listen(PORT, () => {
	console.log(`Gateway is running on PORT ${PORT}`);
});