import { Router } from 'express';
import Question from '../models/Question';
import Unit from '../models/Unit';
import { InvalidParameterError, NotFoundError } from '../utils/errors';
import { pickProps } from '../utils/functions';
import { asyncHandler, requireAdmin } from '../utils/middleware';
import { success } from '../utils/responses';
import { isNonEmptyString } from '../utils/validators';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
	const units = await Unit.findAll({ include: [Question] });

	const unitsData = units.map(u => {
		const unitJSON = u.toJSON();

		unitJSON.questions = (unitJSON.questions as Question[]).map(q => pickProps(q, ['id', 'questionType']));

		return unitJSON;
	});

	success(res, unitsData);
}));

router.get('/:id', asyncHandler(async (req, res) => {
	const id = parseInt(req.params.id, 10);
	if (isNaN(id)) { throw new InvalidParameterError('unit ID'); }

	const unit = await Unit.findById(id, { include: [Question] });
	if (unit === null) { throw new NotFoundError('Unit'); }

	const unitData = unit.toJSON();

	for (const question of unitData.questions) {
		// Don't show correct answer unless requested by an admin
		if (!(req.authorized && req.authorized.admin)) {
			delete question.correctAnswer;
		}
	}

	success(res, unitData);
}));

router.put('/:id', requireAdmin, asyncHandler(async (req, res) => {
	const id = parseInt(req.params.id, 10);
	if (isNaN(id)) { throw new InvalidParameterError('unit ID'); }

	const title = req.body.title;
	if (!isNonEmptyString(title)) { throw new InvalidParameterError('title'); }

	const description = req.body.description;
	if (!isNonEmptyString(description)) { throw new InvalidParameterError('description'); }

	const questionIds: number[] = req.body.questionIds;
	if (!(questionIds instanceof Array && questionIds.every(i => typeof i === 'number'))) {
		throw new InvalidParameterError('question IDs');
	}

	// Save unit
	await Unit.upsert({ id, title, description });

	// Update all given questions
	await Question.update({ unitId: id }, { where: { id: questionIds } });

	success(res);
}));

export default router;
