import { Router } from 'express';
import User from '../models/User';
import { asyncHandler, requireLoggedIn } from '../utils/middleware';
import { success } from '../utils/responses';

const router = Router();

router.get('/', requireLoggedIn, asyncHandler(async (req, res) => {
	const user = await User.findById(req.authorized!.user);

	success(res, user!);
}));

export default router;
