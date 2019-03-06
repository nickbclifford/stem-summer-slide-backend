import { Router } from 'express';
import Answer from '../models/Answer';
import Question, { AnswerFormat } from '../models/Question';
import { InvalidParameterError, NotFoundError } from '../utils/errors';
import { asyncHandler, requireLoggedIn } from '../utils/middleware';
import { success } from '../utils/responses';
import { isNonEmptyString } from '../utils/validators';

const EPSILON = 1e-3;

const router = Router();

router.post('/', requireLoggedIn, asyncHandler(async (req, res) => {
	const content = req.body.content;
	if (!isNonEmptyString(content)) { throw new InvalidParameterError('content'); }
	const questionId = req.body.questionId;
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
		// TODO: Make sure image exists and is valid
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

router.get('/:id', requireLoggedIn, asyncHandler(async (req, res) => {
	const id = parseInt(req.params.id, 10);
	if (isNaN(id)) { throw new InvalidParameterError('answer ID'); }

	const answer = await Answer.findById(id);
	if (answer === null) { throw new NotFoundError('Answer'); }

	success(res, answer.toJSON());
}));

// TODO: Should students be able to modify their answers without totally resubmitting?

export default router;
