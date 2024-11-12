const path = require('path');
const { fileURLTOPath } = require('url');
const express = require('express');
const { TranslateClient, TranslateTextCommand } = require('@aws-sdk/client-translate');
const { StartSpeechSynthesisTaskCommand } = require('@aws-sdk/client-polly');
const { PollyClient } = require('@aws-sdk/client-polly');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const REGION = "us-east-1";

const app = express();
app.use(express.static('public')); // this is added!
app.use(express.json());
app.use('/css', express.static('public/stylesheets'));


const translateClient = new TranslateClient({ region: REGION });
const pollyClient = new PollyClient({ region: REGION });
const s3Client = new S3Client({ region: 'us-east-1' });



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/polly.html');
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
	const outputUri = response.SynthesisTask.OutputUri;
        console.log(outputUri);
	const baseUrl = 'https://s3.us-east-1.amazonaws.com/aws-project-ahf/';
        const objectKey = outputUri.replace(baseUrl, '');
	console.log('Object key: '+objectKey);
	const audiourl = await getPresignedUrl("aws-project-ahf", objectKey, 3600);
	console.log(audiourl);
	res.status(200).json({ AudioUrl: audiourl });
        console.log(`Success, audio file ${outputUri} added to ${params.OutputS3BucketName}`);
      } catch (err) {
        console.log("Error putting object", err);
      }
});

async function getPresignedUrl(bucketName, objectKey, expirationInSeconds) {

    const command = new GetObjectCommand({

        Bucket: bucketName,

        Key: objectKey 
    });

    console.log(command);

    const url = await getSignedUrl(s3Client, command, { expiresIn: expirationInSeconds });

    return url;

}


const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

