import { Router } from 'express';
import Question from '../models/Question';
import Unit from '../models/Unit';
import { InvalidParameterError, NotFoundError } from '../utils/errors';
import { asyncHandler, requireAdmin } from '../utils/middleware';
import { success } from '../utils/responses';
import { isNonEmptyString } from '../utils/validators';

const router = Router();

router.get('/:id', asyncHandler(async (req, res) => {
	const id = parseInt(req.params.id, 10);
	if (isNaN(id)) { throw new InvalidParameterError('unit ID'); }

	const unit = Unit.findById(id, { include: [Question] });
	if (unit === null) { throw new NotFoundError('Unit'); }

	success(res, unit.toJSON());
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
