import { transcribeDiarizedAudio } from "./utils/deepgram-transcribe.js";
import { removeDuplicates } from "./utils/removeDuplicates.js";
import { completePrompt } from "./utils/generate-script.js";
import { upload } from "./utils/storage.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());

app.get("/status", (req, res) => {
	res.send("Server is up now.");
});

app.post("/api/upload_record", upload.single("record"), (req, res) => {
	res.json({
		file_name: req.file.filename,
		mimetype: req.file.mimetype,
	});
});

app.post("/api/get_transcript", async (req, res) => {
	// PASS IN FILE NAME - SEND BACK DIARIZED AUDIO
	res.send(await transcribeDiarizedAudio(req.body.file_name));
});

app.post("/api/remove_duplicates", async (req, res) => {
	// PASS IN FILE NAME - SEND BACK DIARIZED AUDIO
	res.send(await removeDuplicates(req.body.file_name));
});

app.get("/api/get_faq_cards", (req, res) => {
	// Set headers for Server-Sent Events
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");
	console.log("Client connected to SSE");

	// PASS IN FILE NAME + OPTIONAL MODIFIERS
	// Call your function and pass in the res object
	completePrompt(
		req.query.fileName, // The file name of the transcript to inject into the prompt
		req.query.generateSingleSpeakerFiles || true, // Generate (or re-write) the single-speaker transcripts for fileName
		req.query.useSingleSpeakerText || false, // Inject into the prompt the single-speaker transcript instead of the orginal
		req.query.useContinue || true, // Should the prompt be a chain of 'continue:' calls, or a single big prompt?
		(data) => res.write(`data: ${JSON.stringify(data)}\n\n`), // Send data to client
		() => res.end() // End the response
	);
});

app.listen(3000, () => console.log("Server is running"));
