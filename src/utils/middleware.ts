import { ErrorRequestHandler, RequestHandler } from 'express';
import { APIError, InternalError } from './errors';
import { error } from './responses';

export function asyncHandler(route: RequestHandler): RequestHandler {
	return (req, res, next) => {
		Promise.resolve(route(req, res, next)).catch(next);
	};
}

// noinspection JSUnusedLocalSymbols
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	if (!(err instanceof APIError)) { err = new InternalError(); }

	error(res, err);
};
