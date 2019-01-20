import { ErrorRequestHandler, RequestHandler } from 'express';
import { verify } from 'jsonwebtoken';
import { UniqueConstraintError, ValidationError } from 'sequelize';
import { promisify } from 'util';
import config from '../config';
import User from '../models/User';
import { APIError, InternalError, InvalidParameterError, UnauthorizedError } from './errors';
import { error } from './responses';
import { isNonEmptyString } from './validators';

export function asyncHandler(route: RequestHandler): RequestHandler {
	return (req, res, next) => {
		Promise.resolve(route(req, res, next)).catch(next);
	};
}

// It needs to be declared with 4 arguments otherwise Express doesn't recognize it as an error handler
// noinspection JSUnusedLocalSymbols
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	// Custom error messages for ORM errors
	if (err instanceof UniqueConstraintError) {
		const errorString = (err as UniqueConstraintError).errors.map(e => e.path).join(', ');
		err = new APIError(`${errorString.charAt(0).toUpperCase() + errorString.substring(1)} already exists.`, 409);
	} else if (err instanceof ValidationError) {
		err = new InvalidParameterError((err as ValidationError).errors.map(e => e.path).join(', '));
	} else if (!(err instanceof APIError)) {
		err = new InternalError();
	}

	error(res, err);
};

declare global {
	namespace Express {
		// noinspection JSUnusedGlobalSymbols
		interface Request {
			authorized: {
				user: User['id'],
				admin: User['admin']
			} | null;
		}
	}
}

export const jwtHandler: RequestHandler = (req, res, next) => {
	req.authorized = null;

	const header = req.headers.authorization;

	// If there's no auth header or it's just empty, it's probably fine and we can just ignore it
	if (!isNonEmptyString(header)) {
		next();
		return;
	}

	// Otherwise, make sure it's in the correct format
	if (!header.startsWith('Bearer ')) {
		next(new InvalidParameterError('authorization header'));
		return;
	}

	// Finally, do all the important verification stuff
	promisify(verify)(header.substring(7), config.jwtSecret).then((payload: { [key: string]: any }) => {
		req.authorized = {
			user: payload.user,
			admin: payload.admin
		};

		next();
	}).catch(() => next(new InvalidParameterError('authorization token')));
};

export const requireLoggedIn: RequestHandler = (req, res, next) => {
	if (req.authorized === null) {
		next(new UnauthorizedError());
	} else {
		next();
	}
};

export const requireAdmin: RequestHandler = (req, res, next) => {
	if (req.authorized === null || !req.authorized.admin) {
		next(new UnauthorizedError());
	} else {
		next();
	}
};
