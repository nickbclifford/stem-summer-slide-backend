import { Router } from 'express';
import multer from 'multer';
import config from '../config';
import Answer from '../models/Answer';
import Question, { AnswerFormat } from '../models/Question';
import { APIError, InvalidParameterError, NotFoundError, UnauthorizedError } from '../utils/errors';
import { asyncHandler, requireLoggedIn } from '../utils/middleware';
import { success } from '../utils/responses';
import { isNonEmptyString } from '../utils/validators';

const EPSILON = 1e-3;

const router = Router();

const validMimeTypes: { [mime: string]: string } = {
	'image/png': 'png',
	'image/jpeg': 'jpg'
};

const upload = multer({
	storage: multer.diskStorage({
		destination: __dirname + '/../../uploads',
		filename(req, file, callback) {
			callback(null, `user${req.authorized!.user}-${Date.now()}.${validMimeTypes[file.mimetype]}`);
		}
	}),
	limits: { fileSize: 2097152 }, // 2 MiB
	fileFilter(req, file, callback) {
		if (!req.authorized) {
			callback(new UnauthorizedError(), false);
			return;
		}
		if (typeof validMimeTypes[file.mimetype] === 'undefined') {
			callback(new InvalidParameterError('file type'), false);
			return;
		}

		callback(null, true);
	}
});

router.post('/', requireLoggedIn, asyncHandler(async (req, res) => {
	const content = req.body.content;
	if (!isNonEmptyString(content)) { throw new InvalidParameterError('content'); }
	const questionId = req.body.questionId;
	// noinspection SuspiciousTypeOfGuard
	if (typeof questionId !== 'number') { throw new InvalidParameterError('question ID'); }

	const question = await Question.findById(questionId);
	if (question === null) { throw new NotFoundError('Question'); }

	let points = null;

	if (question.answerFormat === AnswerFormat.NUMERICAL) {
		const numeric = parseFloat(content);
		if (isNaN(numeric)) { throw new InvalidParameterError('content'); }

		if (question.correctAnswer! - EPSILON <= numeric && numeric <= question.correctAnswer! + EPSILON) {
			// TODO: Does this make sense?
			points = question.maxPoints;
		}
	}
	if (question.answerFormat === AnswerFormat.IMAGE) {
		throw new APIError('Image submissions cannot be sent to this route.');
	}

	const answer = new Answer({
		content,
		points,
		userId: req.authorized!.user,
		questionId
	});
	await answer.save();

	success(res, { id: answer.id });
}));

// Because of Multer, req.body is all the text form data fields
router.post('/image', requireLoggedIn, upload.array('images'), asyncHandler(async (req, res) => {
	const questionId = parseInt(req.body.questionId, 10);
	if (isNaN(questionId)) { throw new InvalidParameterError('question ID'); }

	const question = await Question.findById(questionId);
	if (question === null) { throw new NotFoundError('Question'); }

	if (question.answerFormat !== AnswerFormat.IMAGE) {
		throw new APIError('Only image submissions can be sent to this route.', 400);
	}

	if (req.files.length === 0) {
		throw new APIError('At least one image is required.', 400);
	}

	const urlList = (req.files as Express.Multer.File[]).map(f => `${config.hostedOn}/uploads/${f.filename}`).join(' ');

	const answer = new Answer({
		content: urlList,
		userId: req.authorized!.user,
		questionId
	});
	await answer.save();

	success(res, { id: answer.id });
}));

router.get('/:id', requireLoggedIn, asyncHandler(async (req, res) => {
	const id = parseInt(req.params.id, 10);
	if (isNaN(id)) { throw new InvalidParameterError('answer ID'); }

	const answer = await Answer.findById(id);
	if (answer === null) { throw new NotFoundError('Answer'); }

	success(res, answer.toJSON());
}));

export default router;
