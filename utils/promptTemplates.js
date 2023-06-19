import {
	SystemMessagePromptTemplate,
	HumanMessagePromptTemplate,
	ChatPromptTemplate,
	MessagesPlaceholder,
} from "langchain/prompts";

export const removeSpeakerTemplate = `There are two primary speakers in the array below: Speaker 0 and Speaker 1 (or Speaker 1 and Speaker 2)

One of these Speakers is a sales rep and the other is a prospect. The sales rep is the one who introduces themselves as someone from Air Ai and/or states that the call is being recorded for quality assurance and/or talks about clients they've helped or businesses they've scaled and/or offers a consulting call and offers time to book a call.

Analyze the transcript and determine which speaker is the sales rep. Once you have the answer, just state "0" or "1" or "2" or "3" with no quotation marks:

{transcript}`;

// Define a (reusable) prompt template
export const removeSimilarFAQsPrompt = ChatPromptTemplate.fromPromptMessages([
	SystemMessagePromptTemplate.fromTemplate(
		`re-write this list of Q&A pairs but remove similar duplicates (if there are any) to consolidate the list:`
	),
	HumanMessagePromptTemplate.fromTemplate(
		`Here is the list of Q&A pairs: {input}`
	),
]);

// PROMPT TEMPLATE WITH MEMORY SO I CAN JUST RESPOND "continue:"
export const statefulFAQExtractionPrompt = (transcript) => {
	return ChatPromptTemplate.fromPromptMessages([
		SystemMessagePromptTemplate.fromTemplate(`your job is to extract important information about the "reps" company that they work for that I am going to add to training. Listen for questions about the "Reps" company and the answer the rep gives:

        turn the few relevant facts in this call into question and answer pairs.
        
        transcript:
        
        ${transcript}
        
        ---------
        before outputting your answer remember you dont do any Q&A pairs for specifics pertaining to the prospect since this is only generic facts about the company the rep works for.
        
        Give ZERO outputs that are about the prospect`),
		new MessagesPlaceholder("history"),
		HumanMessagePromptTemplate.fromTemplate("{input}"),
	]);
};
