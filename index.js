const path = require('path');
const { fileURLTOPath } = require('url');
const express = require('express');
const { TranslateClient, TranslateTextCommand } = require('@aws-sdk/client-translate');
const { StartSpeechSynthesisTaskCommand } = require('@aws-sdk/client-polly');
const { PollyClient } = require('@aws-sdk/client-polly');
const REGION = "us-east-1";

const app = express();
app.use(express.static('public')); // this is added!
app.use(express.json());
app.use('/css', express.static('public/stylesheets'));


const translateClient = new TranslateClient({ region: REGION });
const pollyClient = new PollyClient({ region: REGION });


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

app.post('/polly', async (req, res) => {
    const {languageCode, voidId, text } = req.body;

    // Create the parameters
    const params = {
        OutputFormat: "mp3",
        OutputS3BucketName: "aws-project-ahf",
        LanguageCode: languageCode,
        Text: text,
        TextType: "text",
        VoiceId: voidId,
        SampleRate: "22050",
    };

    try {
        const response = await pollyClient.send(new StartSpeechSynthesisTaskCommand(params));
        console.log(`Success, audio file ${response} added to ${params.OutputS3BucketName}`);
      } catch (err) {
        console.log("Error putting object", err);
      }
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

