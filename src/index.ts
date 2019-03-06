// Basic configuration
import { Sequelize } from 'sequelize-typescript';
import config from './config';

// Initialize Sequelize
const sequelize = new Sequelize({
	dialect: 'postgres',
	...config.postgres,
	modelPaths: [__dirname + '/models']
});

// Express
import express from 'express';

// Middleware
import { json } from 'body-parser';
import { errorHandler, jwtHandler } from './utils/middleware';

// Routers
import answerRouter from './routes/answer';
import authRouter from './routes/auth';
import questionRouter from './routes/question';
import unitRouter from './routes/unit';
import userRouter from './routes/user';

sequelize.sync({ force: config.forceModelSync }).then(() => {
	console.log('models synced!');

	// Initialize Express
	const app = express();

	// Middleware
	app.use(json());
	app.use(jwtHandler);

	// Child routers
	app.use('/answer', answerRouter);
	app.use('/auth', authRouter);
	app.use('/question', questionRouter);
	app.use('/unit', unitRouter);
	app.use('/user', userRouter);

	// Error handler (must be last in the chain!)
	app.use(errorHandler);

	app.listen(config.port, () => {
		console.log(`Server listening on *:${config.port}`);
	});
});
