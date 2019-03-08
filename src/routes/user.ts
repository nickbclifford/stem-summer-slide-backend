import { Router } from 'express';
import User from '../models/User';
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

export default router;
