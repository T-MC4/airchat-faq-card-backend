import { ChatOpenAI } from "langchain/chat_models/openai";
import { approximateTokens } from "./countTokens";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function removeDuplicates(transcript) {
	const prompt = `re-write this list of Q&A pairs but remove similar duplicates (if there are any) to consolidate the list: 
    ${transcript}`;

	// Determine the MAX amount of tokens available for an LLM completion
	const maxTokens = 16000;
	const usedTokens = approximateTokens(prompt) + approximateTokens(transcript);
	const responseTokens = maxTokens - usedTokens - 1000; // Buffer/hedge

	// Initiate an LLM instance and set the options
	const removeDuplicates = new ChatOpenAI({
		openAIApiKey: OPENAI_API_KEY,
		modelName: "gpt-3.5-16k",
		temperature: 0,
		maxTokens: responseTokens,
	});

	const noDuplicates = await removeDuplicates.call([
		new HumanChatMessage(prompt),
	]);
	console.log(noDuplicates.text);

	// return array
	return JSON.stringify(noDuplicates.text); // ie. [0,1,0,0,1,0,0,0,1,0,3,1]
}
