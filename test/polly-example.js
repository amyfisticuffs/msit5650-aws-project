const { StartSpeechSynthesisTaskCommand } = require('@aws-sdk/client-polly');
// snippet-start:[polly.JavaScript.createclientv3]
const { PollyClient } = require('@aws-sdk/client-polly');
// Set the AWS Region.
const REGION = "us-east-1"; //e.g. "us-east-1"
// Create an Amazon S3 service client object.
const pollyClient = new PollyClient({ region: REGION });
// snippet-end:[polly.JavaScript.createclientv3]

// import { pollyClient } from "./libs/pollyClient.js";

// Create the parameters
const params = {
  OutputFormat: "mp3",
  OutputS3BucketName: "aws-project-ahf",
  LanguageCode: "en-IE",
  Text: "Hello Owen, How are you?",
  TextType: "text",
  VoiceId: "Joanna",
  SampleRate: "22050",
};

const run = async () => {
  try {
    const response = await pollyClient.send(new StartSpeechSynthesisTaskCommand(params));
    console.log(`Success, audio file ${response} added to ${params.OutputS3BucketName}`);
  } catch (err) {
    console.log("Error putting object", err);
  }
};
run();
