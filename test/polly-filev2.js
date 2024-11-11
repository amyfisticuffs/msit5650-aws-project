// Import the AWS SDK and File System (fs) module
const AWS = require('aws-sdk');
const fs = require('fs');

// Configure AWS SDK (replace 'us-east-1' with your preferred region)
AWS.config.update({ region: 'us-east-1' });

// Create a Polly client
const polly = new AWS.Polly();

// Define the Polly parameters
const params = {
  Text: "Eric, this message came from the cloud",
  OutputFormat: "mp3",
  VoiceId: "Joanna"
};

// Function to synthesize speech and save it locally
function synthesizeSpeech() {
  polly.synthesizeSpeech(params, (err, data) => {
    if (err) {
      console.error("Error synthesizing speech:", err);
      return;
    }

    // Check if AudioStream is a valid Buffer
    if (data && data.AudioStream instanceof Buffer) {
      // Write the audio stream to an MP3 file
      const outputFilePath = 'output.mp3';
      fs.writeFile(outputFilePath, data.AudioStream, (writeErr) => {
        if (writeErr) {
          console.error("Error writing audio file:", writeErr);
        } else {
          console.log(`Audio file successfully saved as ${outputFilePath}`);
        }
      });
    } else {
      console.error("Invalid audio stream received from Polly.");
    }
  });
}

// Run the speech synthesis function
synthesizeSpeech();

