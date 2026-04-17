import axios from 'axios';
import 'dotenv/config';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN

export const downloadImage = async (fileId) => {
	try {
		// Asking telegram for the file path
		const fileInfoUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile?file_id=${fileId}`;
		const fileInfoResponse = await axios.get(fileInfoUrl);
	
		// Extracting file_path from the JSON response
		const filePath = fileInfoResponse.data.result.file_path;
	
		// Downloading URL for the image
		const downloadUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`;
	
		// Telling axios to return binary data (type arraybuffer) and not text
		const imageResponse = await axios.get(downloadUrl, {
			responseType: 'arraybuffer'
		});
	
		// Converting the raw binary data into a Node.js Buffer
		return Buffer.from(imageResponse.data);

	} catch (error) {
		console.error("Failed to download image from Telegram:", error.message);
		throw error;
	};
};

