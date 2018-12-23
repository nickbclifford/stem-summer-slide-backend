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
