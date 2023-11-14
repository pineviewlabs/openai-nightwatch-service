import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import { OpenAI } from 'openai';
import { unlink } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const STORAGE_PATH = join(__dirname, '..', 'uploads/');
const { BASE_URL } = process.env;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, STORAGE_PATH);
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

    cb(null, `${file.fieldname}-${uniqueSuffix}.png`);
  }
})


const upload = multer({ storage: storage });
const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/analyze-error', upload.single('screenshot'), async (req, res) => {
  try {
    const { errorMessage, stackTrace, codeSnippet } = req.body;
    const { file: imageFile } = req;

    const imageUrl = `${BASE_URL}/uploads/${imageFile.filename}`;
    // console.log('imageUrl', imageUrl);
    const additionalDetails = JSON.parse(req.body.additionalDetails);
    const details = `Additional details: Nightwatch version: ${additionalDetails.nightwatchVersion}, config file: ${additionalDetails.configFile}, platform: ${additionalDetails.platform}, browser: ${additionalDetails.browser}, headless mode: ${additionalDetails.headless}.`;
    // Create messages for the OpenAI API
    const messages = [
      {
        role: "system",
        content: "You are an expert in web development using Node.js, front-end frameworks like React and Vite, automated and integration testing with Selenium WebDriver, and the Nightwatch.js framework."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Investigate and explain why the tests failed. Assume an advanced user and give brief and concrete responses. When appropriate, if the error message contains a css selector, provide a quick way to debug the element, like so: 1) update the test code by prepending the line: .debug({selector: "REPLACE_WITH_ACTUAL"}) before the line which caused the error and 2. run nightwatch using the flags: --debug --devtools, then inspect the DevTools Console. Nightwatch supports auto-waiting for elements. Error message: ${errorMessage}\n.Code snippet from test case where the error occurred: ${codeSnippet}. ${details}`
          }
        ]
      },
      // {
      //   role: "user",
      //   content: [
      //     { type: "text", text: "The image provided is the screenshot taken of the browser window at the time of the test failure. Provide any useful feedback which might help with figuring out why the test failed." },
      //     {
      //       type: "image_url",
      //       image_url: imageUrl
      //     },
      //   ],
      // }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages,
      max_tokens: 600,
    });

    res.json({ analyzedResult: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
	  await deleteImage(req.file.filename);
  }
});

async function deleteImage(filename) {
  try {
    await unlink(join(STORAGE_PATH, filename));
  } catch (error) {
    console.error('Error deleting screenshot:', error);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
