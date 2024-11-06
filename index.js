const path = require('path');
const {fileURLTOPath} = require('url');
const express = require('express');
const { TranslateClient, TranslateTextCommand } = require('@aws-sdk/client-translate');

const app = express();
app.use(express.static('public')); // this is added!
app.use(express.json());
app.use('/css', express.static('public/stylesheets'));


const region = 'us-east-1';

const translateClient = new TranslateClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/translate', async (req, res) => {
    const { sourceLanguage, targetLanguage, text } = req.body;

    try {
        const command = new TranslateTextCommand({
            SourceLanguageCode: sourceLanguage,
            TargetLanguageCode: targetLanguage,
            Text: text
        });


        const response = await translateClient.send(command);
        res.status(200).json({ TranslatedText: response.TranslatedText });
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ message: 'Translation error' });
    }
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

