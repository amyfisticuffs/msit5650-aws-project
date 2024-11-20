const express = require('express');
const { TranslateClient, TranslateTextCommand } = require('@aws-sdk/client-translate');
const { PollyClient, StartSpeechSynthesisTaskCommand } = require('@aws-sdk/client-polly');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const REGION = "us-east-1";

const app = express();
app.use(express.static('public'));
app.use(express.json());

const translateClient = new TranslateClient({ region: REGION });
const pollyClient = new PollyClient({ region: REGION });
const s3Client = new S3Client({ region: REGION });

let audioCache = {}; // In-memory cache for pre-signed URLs

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/translate', async (req, res) => {
    const { sourceLanguage, targetLanguage, text } = req.body;

    try {
        // Translate the text
        const translateCommand = new TranslateTextCommand({
            SourceLanguageCode: sourceLanguage,
            TargetLanguageCode: targetLanguage,
            Text: text,
        });
        const translationResponse = await translateClient.send(translateCommand);
        const translatedText = translationResponse.TranslatedText;

        // Generate MP3 with Polly
        const pollyParams = {
            OutputFormat: "mp3",
            OutputS3BucketName: "aws-project-ahf",
            LanguageCode: targetLanguage,
            Text: translatedText,
            TextType: "text",
            VoiceId: getVoiceIdForLanguage(targetLanguage),
        };
        const pollyResponse = await pollyClient.send(new StartSpeechSynthesisTaskCommand(pollyParams));

        const outputUri = pollyResponse.SynthesisTask.OutputUri;
        const key = parseS3Url(outputUri);

        // Create a pre-signed URL for the MP3
        const presignedUrl = await getSignedUrl(
            s3Client,
            new GetObjectCommand({ Bucket: pollyParams.OutputS3BucketName, Key: key }),
            { expiresIn: 3600 }
        );

        // Cache the pre-signed URL temporarily
        audioCache[text] = presignedUrl;

        res.status(200).json({ TranslatedText: translatedText, PresignedAudioUrl: presignedUrl });
    } catch (error) {
        console.error('Error processing translation and audio:', error);
        res.status(500).json({ message: 'Error processing translation and audio' });
    }
});

// Endpoint for retrieving cached audio URLs (optional)
app.get('/audio-cache', (req, res) => {
    res.json(audioCache);
});

const getVoiceIdForLanguage = (languageCode) => {
    const voiceMap = {
        'fr-FR': 'Mathieu',
        'es-ES': 'Lupe',
        'de-DE': 'Hans',
        'en-US': 'Joanna',
    };
    return voiceMap[languageCode] || 'Joanna'; // Default to English
};

const parseS3Url = (s3Url) => {
    const urlParts = new URL(s3Url);
    return urlParts.pathname.split('/').pop();
};

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
