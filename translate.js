const express = require('express');
const { TranslateClient, TranslateTextCommand } = require('@aws-sdk/client-translate');

const app = express();
app.use(express.json());

const region = 'us-east-1';
const translateClient = new TranslateClient({ region });

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/translate', async (req, res) => {
    const { SourceLanguage, TargetLanguage, Text } = req.body;

    try {
        const command = new TranslateTextCommand({
            SourceLanguageCode: SourceLanguage,
            TargetLanguageCode: TargetLanguage,
            Text: Text
        });

        const response = await translateClient.send(command);
        res.status(200).json({ TranslatedText: response.TranslatedText });
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ message: 'Translation error' });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
