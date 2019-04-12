import { Router } from 'express';
import Answer from '../models/Answer';
import Question from '../models/Question';
import Unit from '../models/Unit';
import User from '../models/User';
import { pickProps } from '../utils/functions';
import { asyncHandler, requireLoggedIn } from '../utils/middleware';
import { success } from '../utils/responses';

const router = Router();

router.get('/', requireLoggedIn, asyncHandler(async (req, res) => {
	const user = await User.findById(req.authorized!.user);

	const userData = user!.toJSON();
	delete userData.password;
	delete userData.confirmationHash;

	success(res, userData);
}));

router.get('/next-question', requireLoggedIn, asyncHandler(async (req, res) => {
	const user = await User.findById(req.authorized!.user, {
		include: [{
			model: Answer,
			include: [Question]
		}]
	});

	let nextQuestion: object | null = null;

	const answers = user!.answers.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
	if (answers.length !== 0) {
		const unitId = answers[0].question.unitId;
		const answeredQuestionIds = answers.map(a => a.question).filter(q => q.unitId === unitId).map(q => q.id);

		const unit = await Unit.findById(unitId, { include: [Question] });
		const unitQuestionIds = unit!.questions.map(q => q.id);

		const questionDifference = unitQuestionIds.filter(q => !answeredQuestionIds.includes(q));

		if (questionDifference.length !== 0) { // If not all the questions have been completed
			nextQuestion = pickProps(
				unit!.questions.find(q => q.id === questionDifference[0])!,
				['id', 'questionType', 'unitId']
			);
		}
	}

	success(res, { nextQuestion });
}));

export default router;
