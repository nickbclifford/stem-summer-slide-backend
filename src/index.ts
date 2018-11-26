// Basic configuration
const port = 2400;

// Initialize Express
import express from 'express';
const app = express();

app.get('/', (req, res) => {
	res.json({ hello: 'world!' });
});

app.listen(port, () => {
	console.log(`Server listening on *:${port}`);
});
