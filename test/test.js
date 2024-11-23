const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Hello, LingoSphere!');
});

app.listen(3000, () => {
    console.log('Node.js app running on http://localhost:3000');
});
