// Basic configuration
import { Sequelize } from 'sequelize-typescript';
import config from './config';

// Initialize Sequelize
const sequelize = new Sequelize({
	dialect: 'postgres',
	...config.postgres,
	modelPaths: [__dirname + '/models']
});

import { json } from 'body-parser';
import express from 'express';

// Routers
import userRouter from './routes/user';

sequelize.sync({ force: true }).then(() => {
	console.log('models synced!');

	// Initialize Express
	const app = express();

	// Middleware
	app.use(json());

	// Route handlers
	app.get('/', (req, res) => {
		res.json({ hello: 'world!' });
	});

	app.use('/user', userRouter);

	app.listen(config.port, () => {
		console.log(`Server listening on *:${config.port}`);
	});
});
