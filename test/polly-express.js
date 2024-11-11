const express = require('express');
const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });
const polly = new AWS.Polly();
const app = express();

app.get('/speak', (req, res) => {
  const params = {
    Text: "Hello, this is streamed directly from Polly!",
    OutputFormat: "mp3",
    VoiceId: "Joanna"
  };

  polly.synthesizeSpeech(params, (err, data) => {
    if (err) {
      res.status(500).send("Error synthesizing speech");
    } else if (data && data.AudioStream instanceof Buffer) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.send(data.AudioStream);
    }
  });
});

app.listen(8080, () => {
  console.log('Server running on http://localhost:3000/speak');
});

