import { Response } from 'express';
import { APIError } from './errors';

export function success(res: Response, data: object = {}) {
	res.json({
		error: null,
		data
	});
}

export function error(res: Response, err: APIError) {
	res.status(err.statusCode).json({
		error: err.message,
		data: null
	});
}
