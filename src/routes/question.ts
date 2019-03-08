import { Router } from 'express';
import Answer from '../models/Answer';
import Question, { AnswerFormat, QuestionType } from '../models/Question';
import { APIError, InvalidParameterError, NotFoundError } from '../utils/errors';
import { asyncHandler, requireAdmin } from '../utils/middleware';
import { success } from '../utils/responses';
import { isNonEmptyString, isStringEnumMember } from '../utils/validators';

const router = Router();

router.post('/', requireAdmin, asyncHandler(async (req, res) => {
	const body = req.body.body;
	if (!isNonEmptyString(body)) { throw new InvalidParameterError('body'); }
	const questionType = req.body.questionType;
	if (!isStringEnumMember(QuestionType, questionType)) { throw new InvalidParameterError('question type'); }
	const answerFormat = req.body.answerFormat;
	if (!isStringEnumMember(AnswerFormat, answerFormat)) { throw new InvalidParameterError('answer format'); }
	const unitId = req.body.unitId;
	if (typeof unitId !== 'number') { throw new InvalidParameterError('unit ID'); }
	const maxPoints = req.body.maxPoints;
	if (typeof maxPoints !== 'number') { throw new InvalidParameterError('max points'); }

	const correctAnswer = req.body.correctAnswer as number || null;
	if (answerFormat === AnswerFormat.NUMERICAL && typeof correctAnswer !== 'number') {
		throw new APIError('Numerical questions require a correct answer.', 400);
	}

	const question = new Question({
		body,
		questionType,
		answerFormat,
		unitId,
		maxPoints,
		correctAnswer
	});
	await question.save();

	success(res, { id: question.id });
}));

router.get('/:id', asyncHandler(async (req, res) => {
	const id = parseInt(req.params.id, 10);
	if (isNaN(id)) { throw new InvalidParameterError('question ID'); }

	// Only include answers if requested by an admin
	let options;
	if (req.authorized && req.authorized.admin) {
		options = { include: [Answer] };
	}

	const question = await Question.findById(id, options);
	if (question === null) { throw new NotFoundError('Question'); }

	const questionData = question.toJSON();

	// Don't show correct answer unless requested by an admin
	if (!(req.authorized && req.authorized.admin)) {
		delete questionData.correctAnswer;
	}

	success(res, questionData);
}));

router.patch('/:id', requireAdmin, asyncHandler(async (req, res) => {
	const id = parseInt(req.params.id, 10);
	if (isNaN(id)) { throw new InvalidParameterError('question ID'); }

	const question = await Question.findById(id);
	if (question === null) { throw new NotFoundError('Question'); }

	const body = req.body.body;
	const questionType = req.body.questionType;
	const answerFormat = req.body.answerFormat;
	const unitId = req.body.unitId;
	const maxPoints = req.body.maxPoints;
	const correctAnswer = req.body.correctAnswer as number || null;

	if (typeof body !== 'undefined') {
		if (!isNonEmptyString(body)) { throw new InvalidParameterError('body'); }
		question.body = body;
	}
	if (typeof questionType !== 'undefined') {
		if (!isStringEnumMember(QuestionType, questionType)) { throw new InvalidParameterError('question type'); }
		question.questionType = questionType;
	}
	if (typeof answerFormat !== 'undefined') {
		if (!isStringEnumMember(AnswerFormat, answerFormat)) { throw new InvalidParameterError('answer format'); }
		question.answerFormat = answerFormat;
	}
	if (typeof unitId !== 'undefined') {
		if (typeof unitId !== 'number') { throw new InvalidParameterError('unit ID'); }
		question.unitId = unitId;
	}
	if (typeof maxPoints !== 'undefined') {
		if (typeof maxPoints !== 'number') { throw new InvalidParameterError('max points'); }
		question.maxPoints = maxPoints;
	}
	if (typeof req.body.correctAnswer !== 'undefined') {
		if (answerFormat === AnswerFormat.NUMERICAL && typeof correctAnswer !== 'number') {
			throw new APIError('Numerical questions require a correct answer.', 400);
		}
		question.correctAnswer = correctAnswer;
	}

	await question.save();

	success(res);
}));

export default router;
