const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'tunedModels/onlinenotarizationtuning-zyb8smpvy6yn' });

const chat = async (message) => {
  // const prompt = `Answer the following question using ONLY the information provided.  Do not add any additional context, assumptions, or explanations.  If the information is not present, respond with "Information not available."

  // Question: ${message}`;

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: message,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.01,
        topP: 0.8,
        topK: 20,
        maxOutputTokens: 8192,
        responseMimeType: 'text/plain',
      },
    });

    return result.response;
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
};

module.exports = {
  chat,
};
