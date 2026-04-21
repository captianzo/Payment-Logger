import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { raw } from 'express';

const GenAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = GenAI.getGenerativeModel({
	model: 'gemini-3.1-flash-lite-preview',
	generationConfig: {
		responseMimeType: 'application/json',
	},
	thinkinConfig: {
		thinkingLevel: 'minimal'
	}
});

export const extractTransactionData = async (imageBuffer) => {
	try {
		console.log('Starting Gemini Extraction...');

		const imagePart = {
			inlineData: {
				data: imageBuffer.toString('base64'),
				mimeType: 'image/jpeg'
			}
		}

		const PROMPT = `You are a payment data extraction assistant. Extract transaction details from this UPI payment screenshot.

Rules:
- Return ONLY a valid JSON object. No markdown, no backticks, no explanation, nothing else.
- If a field cannot be found, set it to null.
- Never guess or invent values. Only extract what is clearly visible.

Fields to extract:

"amount"
- The payment amount as a plain number string with "₹" sign in the front and written in Indian currenty format

"date"
- The transaction date in DD-MM-YYYY format
- If the screenshot shows "10 April 2026" or "Apr 8, 2026" or "10 Apr" convert it to DD-MM-YYYY
- If no year is visible, use the most likely current year
- Example: "10-04-2026"

"time"
- The transaction time in 24 hour HH:MM format
- Convert 12 hour to 24 hour if needed
- Example: "17:17" not "5:17 PM"

"upiTransactionId"
- Look for labels: UPI Transaction ID, Transaction ID, Reference Number, Ref No, UTR etc.

"source"
- The payment app used to send the money
- Detect from logo, app name, or UI style visible in the screenshot

Return this exact structure:
{
  "amount": "",
  "date": "",
  "time": "",
  "upiTransactionId": "",
  "source": ""
}
`;

		const result = await model.generateContent([PROMPT, imagePart]);

		const rawJsonText = result.response.text();
		console.log('Raw Gemini Output: ', rawJsonText);

		const parsedData = JSON.parse(rawJsonText);
		return parsedData;

	} catch (error) {
		console.error("Gemini Extraction Failed:", error.message);
		throw error;
	}
}