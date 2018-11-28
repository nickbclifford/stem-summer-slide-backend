// Basic configuration
import { Sequelize } from 'sequelize-typescript';

const port = 2400;

// Initialize Sequelize
// TODO: config.ts?
const sequelize = new Sequelize({
	database: '',
	username: '',
	password: '',
	modelPaths: [__dirname + '/models']
});

// Initialize Express
import express from 'express';
const app = express();

app.get('/', (req, res) => {
	res.json({ hello: 'world!' });
});

app.listen(port, () => {
	console.log(`Server listening on *:${port}`);
});
