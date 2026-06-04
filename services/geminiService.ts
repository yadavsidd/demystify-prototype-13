
import { GoogleGenAI, Chat, Type, GenerateContentResponse, Part } from "@google/genai";
import type { AnalysisResult, SimplifiedClause, ComparisonResult }  from '../types';

// Initialize the Google GenAI client
// API_KEY is injected by Vite at build time. If missing, it defaults to "" via vite.config.ts.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const checkApiKey = () => {
    if (!process.env.API_KEY || process.env.API_KEY.trim() === "") {
        throw new Error("Google Gemini API Key is missing. Please create a .env file in the project root and add API_KEY=your_key_here.");
    }
};

const handleApiError = (error: unknown, context: string): Error => {
    console.error(`Full API Error in ${context}:`, error);
    let errorMessage = `Failed during ${context}. The AI model may have returned an invalid format or an error occurred.`;
    
    if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
            errorMessage = "Your Google Gemini API Key is not valid. Please check your .env file and ensure the key is correct.";
        } else if (error.message.includes("API Key")) {
            // Catches the custom error from checkApiKey()
            errorMessage = error.message;
        } else {
            // Include part of the original error for more context on the UI
            errorMessage = `An error occurred: ${error.message.substring(0, 150)}... Check the console for full details.`;
        }
    }
    
    return new Error(errorMessage);
}


// Define the response schema for document analysis
const analysisResultSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A comprehensive, consistent narrative summary of the document. Explain the 'who, what, where, when, and why'. If the document describes a process (like a lease), describe the lifecycle chronologically."
        },
        keyDates: {
            type: Type.ARRAY,
            description: "A chronologically sorted list of ALL important dates, deadlines, durations, and time-sensitive clauses. Ensure no date is missed.",
            items: {
                type: Type.OBJECT,
                properties: {
                    date: { type: Type.STRING, description: "The specific date (YYYY-MM-DD) or relative timeframe (e.g., '30 days after termination')." },
                    description: { type: Type.STRING, description: "What the date signifies (e.g., 'Lease Expiration', 'Payment Due')." }
                },
                required: ['date', 'description']
            }
        },
        redFlags: {
            type: Type.ARRAY,
            description: "A list of potentially problematic, ambiguous, or risky clauses.",
            items: {
                type: Type.OBJECT,
                properties: {
                    clause: { type: Type.STRING, description: "The exact text or a summary of the clause in question." },
                    explanation: { type: Type.STRING, description: "A simple explanation of why this clause is a potential red flag." },
                    risk: { type: Type.STRING, description: "The potential risk associated with the clause, e.g., 'High', 'Medium', 'Low'." }
                },
                required: ['clause', 'explanation', 'risk']
            }
        },
        actionableNextSteps: {
            type: Type.ARRAY,
            description: "A list of recommended next steps for the user to take.",
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING, description: "The category of the action, e.g., 'Consultation', 'Clarification', 'Action Required'." },
                    step: { type: Type.STRING, description: "A clear, actionable step for the user, e.g., 'Consult a lawyer to review the indemnity clause'." }
                },
                required: ['category', 'step']
            }
        },
        jargonBuster: {
            type: Type.ARRAY,
            description: "A list of complex legal or technical terms found in the document, with simple explanations.",
            items: {
                type: Type.OBJECT,
                properties: {
                    term: { type: Type.STRING, description: "The jargon term." },
                    explanation: { type: Type.STRING, description: "A simple, clear explanation of the term." }
                },
                required: ['term', 'explanation']
            }
        },
        simplifiedBreakdown: {
            type: Type.ARRAY,
            description: "A section-by-section breakdown of the document. Map the original complex legal text to a simplified 'human' explanation. Cover the entire document.",
            items: {
                type: Type.OBJECT,
                properties: {
                    original: { type: Type.STRING, description: "The original text of the section or clause." },
                    simplified: { type: Type.STRING, description: "The plain English translation/explanation of that specific section." }
                },
                required: ['original', 'simplified']
            }
        },
        involvedParties: {
            type: Type.ARRAY,
            description: "A comprehensive list of all people, companies, and entities mentioned in the document.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Name of the person or entity." },
                    role: { type: Type.STRING, description: "Their role in the context of the document (e.g., Landlord, Witness, CEO)." },
                    details: { type: Type.STRING, description: "Specific details found about them (e.g., Address, Email, ID Number). If none, state 'No additional details'." },
                    type: { type: Type.STRING, enum: ['Individual', 'Company', 'Other'], description: "The type of entity." }
                },
                required: ['name', 'role', 'details', 'type']
            }
        },
        acceptanceScore: {
            type: Type.NUMBER,
            description: "A score from 1 to 100 representing the document's fairness and safety for the user. 1 is extremely risky, 100 is perfectly safe."
        },
        scoreJustification: {
            type: Type.STRING,
            description: "A brief, one-sentence justification for the given score."
        },
        potentialScore: {
            type: Type.NUMBER,
            description: "An estimated score from 1 to 100 representing what the score could be if the actionable next steps are successfully implemented."
        },
        potentialScoreJustification: {
            type: Type.STRING,
            description: "A brief, one-sentence justification for the potential score improvement."
        },
        fullExtractedText: {
            type: Type.STRING,
            description: "The full, complete text extracted from the document. This is mandatory for all file types, including images and PDFs. Reconstruct the text as accurately as possible."
        }
    },
    required: ['summary', 'keyDates', 'redFlags', 'actionableNextSteps', 'jargonBuster', 'simplifiedBreakdown', 'involvedParties', 'acceptanceScore', 'scoreJustification', 'potentialScore', 'potentialScoreJustification', 'fullExtractedText']
};

const comparisonResultSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "A summary of the key differences between the two documents." },
        differences: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING, description: "The category of the difference (e.g., 'Payment Terms', 'Liability')." },
                    doc1: { type: Type.STRING, description: "What Document 1 says." },
                    doc2: { type: Type.STRING, description: "What Document 2 says." },
                    significance: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                    explanation: { type: Type.STRING, description: "Why this difference matters." }
                },
                required: ['category', 'doc1', 'doc2', 'significance', 'explanation']
            }
        },
        commonClauses: { type: Type.ARRAY, items: { type: Type.STRING } },
        missingInDoc2: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key clauses present in Doc 1 but missing in Doc 2." },
        riskAssessment: { type: Type.STRING, description: "Assessment of which document carries more risk and why." },
        betterOption: { type: Type.STRING, enum: ['Document 1', 'Document 2', 'Neutral'], description: "Which document is generally more favorable to the user (assuming standard role)." }
    },
    required: ['summary', 'differences', 'commonClauses', 'missingInDoc2', 'riskAssessment', 'betterOption']
};

// Helper to create content parts based on mime type
const createContentParts = (content: string, mimeType: string, textPrompt: string): Part[] => {
    if (mimeType.startsWith('text/')) {
        return [{ text: `${textPrompt}\n\n${content}` }];
    } else {
        return [
            {
                inlineData: {
                    data: content,
                    mimeType: mimeType
                }
            },
            { text: textPrompt }
        ];
    }
};

/**
 * Analyzes a document to extract a summary, key dates, red flags, and next steps.
 * @param content The base64 encoded content of the file or plain text.
 * @param mimeType The MIME type of the file.
 * @param userRole The role of the user (e.g., "Tenant", "Buyer").
 * @param jurisdiction The legal jurisdiction (e.g., "California").
 * @returns A structured analysis result.
 */
export const analyzeDocument = async (content: string, mimeType: string, userRole?: string, jurisdiction?: string): Promise<AnalysisResult> => {
    try {
        checkApiKey();
        
        const contextPrompt = `
        ${userRole ? `**USER ROLE:** You are analyzing this document specifically for the **${userRole}**. Highlight risks that are specific to this role.` : ''}
        ${jurisdiction ? `**JURISDICTION:** The document is governed by the laws of **${jurisdiction}**. Flag any clauses that might be invalid or non-standard in this jurisdiction.` : ''}
        `;

        const promptText = mimeType.startsWith('text/') 
            ? `Analyze the following document. ${contextPrompt}` 
            : `Analyze the provided document. Extract key information based on the requested JSON schema. ${contextPrompt}`;

        const parts = createContentParts(content, mimeType, promptText);
        
        const systemInstruction = `You are an expert legal assistant named Demystify. Your task is to analyze the provided document and return a structured JSON object. 
        Your entire analysis must be extremely clear, simple, and easy for a non-lawyer to understand.

        **FORMATTING RULE:** The text in all JSON fields must be plain text. Do NOT use any markdown formatting (like **, *, #, or lists with -).

        **Crucially, first identify the specific roles of the parties involved (e.g., "Landlord and Tenant", "Seller and Buyer", "Client and Freelancer"). Use these specific roles instead of generic terms like "Party A" or "Person 1" throughout your entire response.**

        **DATA RETRIEVAL & CONSISTENCY RULES:**
        1.  **Full Text Extraction:** You must extract the text perfectly. For images/PDFs, perform high-accuracy OCR.
        2.  **Timeline Consistency:** In 'Key Dates', extract EVERY single date, deadline, or duration. Sort them chronologically. If a date is relative (e.g., "30 days after X"), explain it clearly.
        3.  **Narrative Consistency:** The 'Summary' must be consistent with the extracted clauses. It should tell the story of the document from start to finish.
        4.  **People & Entities:** Extract every person, company, or legal entity mentioned. Find their specific details (address, ID, contact info) if available in the text.

        Follow these steps for the analysis:
        - **fullExtractedText:** Extract the complete text. Mandatory.
        - **Summary:** Write a comprehensive summary of the document's purpose, terms, and lifecycle. Use the identified roles.
        - **Simplified Breakdown:** Break the document down into logical sections. Provide "original" text and "simplified" plain English translation for each.
        - **Key Dates:** Identify all critical dates and deadlines. Sort chronologically.
        - **Red Flags:** Highlight any clauses that are potentially problematic, ambiguous, one-sided, or high-risk. **Prioritize risks that affect the specific User Role if provided.**
        - **Actionable Next Steps:** Provide clear, actionable next steps for the user.
        - **Jargon Buster:** Identify and explain complex terms.
        - **Involved Parties:** Extract data about all people and entities mentioned.
        - **Acceptance Score:** Rate from 1-100 based on fairness and risk. Provide a justification.
        - **Potential Score:** Estimate score after resolving next steps.

        Do not add any commentary outside of the JSON structure. Your response must be only the JSON object.`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: analysisResultSchema
            }
        });
        
        const jsonText = response.text?.trim();
        if (!jsonText) {
            throw new Error("Received an empty or invalid response from the AI model.");
        }
        const result = JSON.parse(jsonText);
        
        // Basic validation to ensure the result matches the expected structure
        if (!result.summary || !result.fullExtractedText) {
            throw new Error("Analysis result is missing required fields like summary or fullExtractedText.");
        }

        // Inject context back into result for UI display
        if (userRole) result.userRole = userRole;
        if (jurisdiction) result.jurisdiction = jurisdiction;

        return result as AnalysisResult;

    } catch (error) {
        throw handleApiError(error, "document analysis");
    }
};

export const compareDocuments = async (
    doc1: {content: string, mimeType: string}, 
    doc2: {content: string, mimeType: string}
): Promise<ComparisonResult> => {
    try {
        checkApiKey();
        const parts: Part[] = [];
        
        // Add Doc 1
        if (doc1.mimeType.startsWith('text/')) {
            parts.push({ text: `--- DOCUMENT 1 ---\n${doc1.content}\n--- END DOCUMENT 1 ---` });
        } else {
            parts.push({ inlineData: { data: doc1.content, mimeType: doc1.mimeType } });
            parts.push({ text: "--- DOCUMENT 1 ABOVE ---" });
        }

        // Add Doc 2
        if (doc2.mimeType.startsWith('text/')) {
            parts.push({ text: `--- DOCUMENT 2 ---\n${doc2.content}\n--- END DOCUMENT 2 ---` });
        } else {
            parts.push({ inlineData: { data: doc2.content, mimeType: doc2.mimeType } });
            parts.push({ text: "--- DOCUMENT 2 ABOVE ---" });
        }

        parts.push({ text: "Compare the two provided documents based on the schema. Identify key differences, missing clauses in the second document compared to the first, and assess risks." });

        const systemInstruction = "You are an expert legal analyst. Compare the two provided documents. Identify key differences, missing clauses in the second document compared to the first, and assess risks. Do not use any markdown formatting in your response fields.";

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: comparisonResultSchema
            }
        });
        
        const jsonText = response.text?.trim();
        if (!jsonText) throw new Error("Empty response");
        return JSON.parse(jsonText) as ComparisonResult;

    } catch (error) {
        throw handleApiError(error, "document comparison");
    }
};

/**
 * Creates a new chat session for follow-up questions about a document analysis.
 * @param docContent The original document content.
 * @param mimeType The document's MIME type.
 * @param initialAnalysis The initial analysis result.
 * @returns A Chat instance.
 */
export const createDocumentAnalysisChat = (docContent: string, mimeType: string, initialAnalysis: AnalysisResult): Chat => {
    checkApiKey();
    const systemInstruction = `You are Demystify, an AI legal assistant. You have just analyzed a document for a user.
    The document's content is provided below. You will now answer follow-up questions from the user based on this document and your initial analysis.
    
    ${initialAnalysis.userRole ? `The user is the **${initialAnalysis.userRole}** in this agreement.` : ''}
    ${initialAnalysis.jurisdiction ? `The jurisdiction is **${initialAnalysis.jurisdiction}**.` : ''}

    Be helpful, clear, and concise. Refer back to the document content when necessary. Your responses must be plain text. Do not use markdown.

    --- DOCUMENT CONTENT (MIME Type: ${mimeType}) ---
    ${docContent}
    --- END DOCUMENT CONTENT ---
    
    --- YOUR INITIAL ANALYSIS ---
    ${JSON.stringify(initialAnalysis, null, 2)}
    --- END INITIAL ANALYSIS ---
    
    Your first message to the user is already provided. Wait for their question.`;

    const chat: Chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction
        }
    });

    return chat;
};

const getContractPrompt = (contractType: string, formData: Record<string, string>): string => {
    const details = Object.entries(formData).map(([key, value]) => `- ${key}: ${value}`).join('\n');
    let instructions = '';

    switch (contractType) {
        case 'Freelance Agreement':
            instructions = `
**Required Clauses to Include:**
1.  **Parties:** Clearly identify the Client and the Freelancer.
2.  **Services:** Detail the scope of work to be performed based on the user input.
3.  **Payment:** Specify the total compensation and payment schedule. Assume payment is due net 30 upon completion unless specified otherwise.
4.  **Term and Termination:** Define the start and end of the agreement and conditions under which either party can terminate it.
5.  **Intellectual Property:** Clarify that upon full payment, the ownership of the final work product transfers to the Client.
6.  **Confidentiality:** Include a standard clause requiring both parties to keep sensitive information confidential.
7.  **Independent Contractor Status:** State clearly that the Freelancer is an independent contractor, not an employee.
8.  **Governing Law:** Include a placeholder for the governing state law.
9.  **Signatures:** Provide signature lines for both parties.`;
            break;
        case 'Residential Lease':
            instructions = `
**Required Clauses to Include:**
1.  **Parties:** Clearly identify the Landlord and the Tenant.
2.  **Property:** State the full address of the rental property.
3.  **Term:** Specify the lease start and end dates.
4.  **Rent:** Detail the monthly rent amount and the due date.
5.  **Security Deposit:** Mention the security deposit amount and conditions for its return.
6.  **Use of Premises:** State that the property is for residential use only.
7.  **Landlord's Access:** Include a clause allowing the landlord to enter the property with reasonable notice (usually 24-48 hours).
8.  **Governing Law:** Include a placeholder for the governing state law.
9.  **Signatures:** Provide signature lines for both Landlord and Tenant.`;
            break;
        case 'Bill of Sale':
             instructions = `
**Required Clauses to Include:**
1.  **Parties:** Clearly identify the Seller and the Buyer.
2.  **Item Description:** Provide a detailed description of the item being sold (VIN, Serial Number, etc.).
3.  **Sale Price:** State the full purchase price.
4.  **Date of Sale:** The date the transaction occurs.
5.  **"As-Is" Warranty:** Include a clause stating the item is sold "as-is," without any warranties of condition or fitness.
6.  **Signatures:** Provide signature lines for both the Seller and the Buyer.`;
            break;
        case 'Non-Disclosure Agreement (NDA)':
            instructions = `
**Required Clauses to Include:**
1.  **Parties:** Clearly identify the Disclosing Party and the Receiving Party.
2.  **Definition of Confidential Information:** Define what constitutes confidential information (trade secrets, business plans, etc.).
3.  **Obligations of Receiving Party:** State that the receiving party must keep the information secret and not use it for their own benefit.
4.  **Exclusions:** List standard exclusions (info already known, info that becomes public, etc.).
5.  **Term:** Specify how long the confidentiality obligations last (based on user input).
6.  **Return of Materials:** Clause requiring the return or destruction of confidential info upon termination.
7.  **Governing Law:** Include a placeholder for the governing state law.
8.  **Signatures:** Provide signature lines for both parties.`;
            break;
        case 'Employment Offer Letter':
            instructions = `
**Required Clauses to Include:**
1.  **Position:** Clearly state the Job Title and the Company Name.
2.  **Start Date:** Specify the employee's start date.
3.  **Compensation:** Detail the salary (annual or hourly) and pay frequency.
4.  **At-Will Employment:** Explicitly state that the employment is "at-will" (meaning either party can terminate at any time).
5.  **Benefits:** Briefly mention eligibility for standard company benefits (or state specifics if provided).
6.  **Reporting Relationship:** Mention who the employee will report to.
7.  **Signatures:** Provide a line for the candidate to sign and accept the offer.`;
            break;
        case 'Cease and Desist Letter':
            instructions = `
**Required Clauses to Include:**
1.  **Sender and Recipient:** Clearly identify who is sending the demand and who is receiving it.
2.  **Description of Infringement:** Detail the specific infringing activity or misconduct based on user input.
3.  **Demand:** Clearly demand that the recipient stop the activity immediately.
4.  **Deadline:** Set a specific deadline for compliance.
5.  **Consequences:** State that legal action may be taken if the demand is not met.
6.  **Reservation of Rights:** Standard clause reserving all legal rights and remedies.`;
            break;
        default:
            instructions = "**Instructions:** Ensure all key details provided by the user are included in a clear and logical format."
    }

    return `You are an expert legal assistant named Demystify. Your task is to draft a professional and clear "${contractType}".
The document should be comprehensive and include standard clauses appropriate for such an agreement, while remaining easy for a non-lawyer to understand.

**Important Formatting Rule:** 
- Use standard Markdown for bolding headings (e.g., **1. Heading**). 
- Do NOT put asterisks around the entire heading line if it's already bolded (i.e. avoid ** **1. Heading** **). 
- Just use **1. Heading**.

Based on the following user-provided details, generate the full contract text.

**User Details:**
${details}

${instructions}

**Final Instructions:**
- Format as a professional plain text document.
- Do not include any commentary or explanation before or after the contract text itself.
- Conclude the entire document with the following disclaimer on a new line:
"Disclaimer: This document was generated by an AI assistant. It is intended for informational purposes and does not constitute legal advice. It is recommended to consult with a legal professional before using or signing this agreement."
`;
}


/**
 * Drafts a contract based on a template and user-provided data, returning a stream.
 * @param contractType The name of the contract to draft.
 * @param formData The user-filled data for the contract.
 * @returns A streaming response of the drafted contract.
 */
export const draftContractStream = async (contractType: string, formData: Record<string, string>) => {
    try {
        checkApiKey();
        const prompt = getContractPrompt(contractType, formData);

        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash', // Use a more capable model for drafting
            contents: prompt
        });
        return responseStream;
    } catch (error) {
        throw handleApiError(error, "contract drafting");
    }
};

/**
 * Rewrites a potentially problematic clause to be more fair and balanced.
 * @param clause The problematic clause text.
 * @param explanation The explanation of why it's a red flag.
 * @returns The suggested rewritten clause as a string.
 */
export const suggestClauseRewrite = async (clause: string, explanation: string): Promise<string> => {
    try {
        checkApiKey();
        const prompt = `A user has identified a problematic clause in a legal document. 
        Your task is to rewrite it to be more fair, balanced, and clear for a non-lawyer.

        **Original Problematic Clause:**
        "${clause}"

        **Reason it's a problem:**
        "${explanation}"

        **Instructions:**
        1.  Rewrite the clause to mitigate the identified problem.
        2.  The new clause should be clear, professional, and easy to understand.
        3.  Provide only the rewritten clause text, without any introductory phrases like "Here is the rewritten clause:" or any explanations.
        4.  The output must be plain text with NO markdown formatting (like **, *).
        `;
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text?.trim() ?? '';
    } catch (error) {
        throw handleApiError(error, "clause rewrite suggestion");
    }
};

/**
 * Generates a professional rebuttal email for negotiating a specific clause.
 * @param originalClause The original problematic clause.
 * @param proposedClause The proposed new clause.
 * @param risk The explanation of the risk associated with the original clause.
 * @returns The email draft as a string.
 */
export const generateRebuttalEmail = async (originalClause: string, proposedClause: string, risk: string): Promise<string> => {
    try {
        checkApiKey();
        const prompt = `You are an expert legal negotiator. Draft a professional, polite, but firm email to a counterparty (like a landlord, employer, or vendor) to negotiate a specific contract clause.
        
        **The Clause in Question:**
        "${originalClause}"
        
        **Why it's a concern:**
        ${risk}
        
        **My Proposed Change:**
        "${proposedClause}"
        
        **Instructions:**
        - Write the body of the email.
        - Subject line is not needed.
        - Be collaborative but protect the user's interests.
        - Clearly state the concern and propose the new wording as a solution.
        - Keep it concise and professional.
        - The entire response must be plain text with NO markdown formatting (like **, *).`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text?.trim() ?? '';
    } catch (error) {
        throw handleApiError(error, "rebuttal email generation");
    }
};

/**
 * Generates a negotiation email covering multiple changed clauses.
 * @param changes An array of strings, each representing a changed clause (new version).
 * @returns The email draft as a string.
 */
export const generateNegotiationEmail = async (changes: string[]): Promise<string> => {
    try {
        checkApiKey();
        const prompt = `You are an expert legal negotiator. I have reviewed a contract and made several edits to improve clarity and fairness. 
        Draft a professional email to the counterparty sending them the revised document and highlighting the changes.

        **The Changes I made (New Clauses):**
        ${changes.map((c, i) => `${i + 1}. "${c}"`).join('\n')}

        **Instructions:**
        - Write the body of the email.
        - Mention that I've attached the revised document.
        - Briefly summarize that I've updated a few clauses for better clarity/fairness.
        - You don't need to list every single change in detail if there are many, but mention the key areas if implied.
        - Tone: Professional, polite, cooperative.
        - The entire response must be plain text with NO markdown formatting (like **, *).
        `;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text?.trim() ?? '';
    } catch (error) {
        throw handleApiError(error, "negotiation email generation");
    }
};


/**
 * Creates a new chat session for the Document Guide feature.
 * @returns A Chat instance.
 */
export const createDocumentGuideChat = (): Chat => {
    checkApiKey();
    const systemInstruction = `You are Demystify's "Document Guide". Your role is to provide clear, step-by-step guidance on official procedures and documents.
    For example, users might ask about getting a passport, applying for a visa, or registering a business.
    Provide helpful, accurate, and easy-to-understand information. Use formatting like lists and bold text to improve readability, but prefer plain text where possible.
    Start the conversation by introducing yourself and asking how you can help.`;
    
    const chat: Chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction
        },
    });

    return chat;
};

/**
 * Translates a document into a specified target language.
 * @param content The text or base64 content of the document.
 * @param mimeType The MIME type of the document.
 * @param targetLanguage The language to translate the document into.
 * @returns The translated document text.
 */
export const translateDocument = async (content: string, mimeType: string, targetLanguage: string): Promise<string> => {
    try {
        checkApiKey();
        const promptText = mimeType.startsWith('text/') 
            ? `Translate the following document to ${targetLanguage}. Preserve the original formatting and tone as much as possible. Do not add any new markdown formatting.` 
            : `Translate the text in this document to ${targetLanguage}. The output should be plain text without any markdown formatting.`;

        const parts = createContentParts(content, mimeType, promptText);

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts }
        });
        return response.text?.trim() ?? '';
    } catch (error) {
        throw handleApiError(error, "document translation");
    }
};

/**
 * Translates the simplified explanations in the breakdown to a target language.
 * @param breakdown The current list of simplified clauses.
 * @param targetLanguage The language to translate the simplified explanations into.
 * @returns A new list of simplified clauses with translated simplified text.
 */
export const translateBreakdown = async (breakdown: SimplifiedClause[], targetLanguage: string): Promise<SimplifiedClause[]> => {
    try {
        checkApiKey();
        const systemInstruction = `You are an expert legal translator. Your task is to translate the "simplified" explanations in the provided JSON array into ${targetLanguage}. 
        IMPORTANT: Do NOT translate the "original" text. Leave it exactly as it is. Only translate the "simplified" value to ${targetLanguage}.
        Do not use any markdown formatting in the translated text.`;
        
        const schema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    original: { type: Type.STRING },
                    simplified: { type: Type.STRING }
                },
                required: ['original', 'simplified']
            }
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: JSON.stringify(breakdown),
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });
        
        const jsonText = response.text?.trim();
        if (!jsonText) return breakdown;
        return JSON.parse(jsonText) as SimplifiedClause[];
    } catch (error) {
        throw handleApiError(error, "breakdown translation");
    }
};

/**
 * Performs a simple, low-cost API call to test if the API key is valid.
 * @returns A success or error message string.
 */
export const testApiKey = async (): Promise<string> => {
    try {
        checkApiKey();
        
        await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'hello'
        });

        return "Diagnostic Test Passed: The API key is valid and can make basic requests. However, this 'Quota Exceeded' error means your project's free limit for complex, high-token analysis has been reached. The only solution is to enable billing on your Google Cloud project.";
    } catch (error) {
        // We call handleApiError to get a nicely formatted Error object, then return its message.
        const formattedError = handleApiError(error, "API key diagnostic test");
        return `Diagnostic test failed. This is the direct response from the server:\n\n${formattedError.message}`;
    }
};
