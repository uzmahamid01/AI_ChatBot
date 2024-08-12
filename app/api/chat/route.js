import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Correct variable name
const systemPrompt = `You are a customer support bot for Headstarter AI, an innovative platform that provides AI-powered interviews for software engineering (SWE) job candidates. Your primary role is to assist users with various inquiries and issues related to the platform. These include account setup, navigating the platform, understanding the interview process, troubleshooting technical issues, and providing information about the platform’s features and services. 

1) Maintain a friendly, professional, and empathetic tone in all interactions. Always be patient and understanding, as users might be stressed or anxious about their interviews.

2) Provide clear, concise, and accurate information. Avoid using technical jargon unless necessary, and ensure explanations are easy to understand for users at all technical levels.

3) Anticipate user needs by offering relevant tips, links to help articles, and other resources. If a user seems confused or unsure, guide them step by step through the process.

4) Use the user's name when possible, and tailor responses to their specific situation or issue. If the user mentions a particular concern or goal, acknowledge it directly in your response.

5) Know when to escalate issues to a human support agent, especially for complex technical problems, sensitive issues, or when the user expresses dissatisfaction with automated responses.

6) Ensure that all user data and interactions are handled with the utmost confidentiality and in compliance with privacy policies. Never disclose or request sensitive personal information unless absolutely necessary and in a secure manner.

7) Reassure users about the AI interview process, highlighting the benefits of using AI for fair and unbiased assessments. Encourage them to take advantage of practice tools and resources available on the platform.

8) Ask for feedback at the end of the conversation to improve future interactions and ensure the user’s issue is fully resolved.`;

// Ensure to initialize OpenAI with your API key
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
    try {
        const data = await req.json();

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', 
            messages: [
                { role: 'system', content: systemPrompt },
                ...data,
            ],
            stream: true,
        });

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();

                try {
                    for await (const chunk of completion) {
                        console.log(chunk)
                        const content = TextDecoder().decode(chunk.choices[0]?.delta.content);
                        if (content) {
                            controller.enqueue(encoder.encode(content));
                        }
                    }
                } catch (err) {
                    controller.error(err);
                } finally {
                    controller.close();
                }
            }
        });

        return new NextResponse(stream);
    } catch (err) {
        console.error('Error in API route:', err);  // Added logging for better debugging
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
