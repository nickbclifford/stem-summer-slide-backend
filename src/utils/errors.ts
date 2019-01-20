export class APIError extends Error {
	constructor(message: string, readonly statusCode: number = 500) {
		super(message);
	}
}

export class InvalidParameterError extends APIError {
	constructor(parameterName: string) {
		super(`Invalid ${parameterName}.`, 400);
	}
}

export class UnauthorizedError extends APIError {
	constructor() {
		super('You are not authorized to access this route.', 401);
	}
}

export class NotFoundError extends APIError {
	constructor(objectName: string) {
		super(`${objectName} not found.`, 404);
	}
}

export class InternalError extends APIError {
	constructor() {
		super('There was an internal error.');
	}
}
