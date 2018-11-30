// Basic configuration
import { Sequelize } from 'sequelize-typescript';
import config from './config';

// Initialize Sequelize
const sequelize = new Sequelize({
	dialect: 'postgres',
	...config.postgres,
	modelPaths: [__dirname + '/models']
});

import express from 'express';

sequelize.sync({ force: true }).then(() => {
	console.log('models synced!');

	// Initialize Express
	const app = express();

	app.get('/', (req, res) => {
		res.json({ hello: 'world!' });
	});

	app.listen(config.port, () => {
		console.log(`Server listening on *:${config.port}`);
	});
});
