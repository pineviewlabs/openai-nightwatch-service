import dotenv from 'dotenv';
import express from 'express';
import { OpenAI } from 'openai';

dotenv.config();

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());
app.post('/analyze-error', async (req, res) => {
  try {

    const { errorMessage, codeSnippet, additionalDetails } = req.body;
    const details = `Additional details: Nightwatch version: ${additionalDetails.nightwatchVersion}, config file: ${additionalDetails.configFile}, platform: ${additionalDetails.platform}, browser: ${additionalDetails.browser}, headless mode: ${additionalDetails.headless}.`;
    const messages = [
      {
        role: "system",
        content: "You are an expert in web development using Node.js, automated testing with Selenium WebDriver, and the Nightwatch.js framework."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Investigate and explain why the tests failed. Error message: ${errorMessage}\n.Code snippet from test case where the error occurred: ${codeSnippet}. ${details}`
          }
        ]
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages,
      max_tokens: 600,
    });

    res.json({ analyzedResult: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));