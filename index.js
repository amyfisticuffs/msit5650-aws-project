const path = require('path');
const { fileURLTOPath } = require('url');
const express = require('express');
const { GetObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl, S3RequestPresigner } = require('@aws-sdk/s3-request-presigner');
const { TranslateClient, TranslateTextCommand } = require('@aws-sdk/client-translate');
const { StartSpeechSynthesisTaskCommand } = require('@aws-sdk/client-polly');
const { PollyClient } = require('@aws-sdk/client-polly');
const REGION = "us-east-1";

const app = express();
app.use(express.static('public')); // this is added!
app.use(express.json());


// const client = new S3Client({ region });
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
            Text: text,
        });


        const response = await translateClient.send(command);
        res.status(200).json({ TranslatedText: response.TranslatedText });
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ message: 'Translation error' });
    }
});

const createPresignedUrlWithClient = ({ region, bucket, key }) => {
    const client = new S3Client({ region });
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(client, command, { expiresIn: 3600 });
};

function parseS3Url(s3Url) {
    try {
        const urlParts = new URL(s3Url);
        const path = urlParts.pathname; // e.g., "/aws-project-ahf/020f84be-6234-42b4-887e-10a6c81c6003.mp3"
        const key = path.substring(path.lastIndexOf('/') + 1); // Extract the filename
        return key;
    } catch (error) {
        throw new Error('Invalid S3 URL format');
    }
}

app.post('/polly', async (req, res) => {
    const { languageCode, voidId, text } = req.body;

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
        const outputUri = response.SynthesisTask.OutputUri;
        const bucketName = params.OutputS3BucketName;
        console.log(`Success, audio file ${outputUri} added to ${bucketName}`);
        const keyName = parseS3Url(outputUri);
        console.log(`Bucket: ${bucketName}, Key: ${keyName}`);
        const clientUrl = await createPresignedUrlWithClient({
            bucket: bucketName,
            region: REGION,
            key: keyName,
        });
        // console.log(`presignedUrl: ${clientUrl}`);
        res.status(200).json({ OutputUri: clientUrl });

    } catch (err) {
        console.log("Error putting object", err);
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
