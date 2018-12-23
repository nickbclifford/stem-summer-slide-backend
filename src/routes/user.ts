import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Router } from 'express';
import { promisify } from 'util';
import User from '../models/User';
import { APIError, InvalidParameterError, NotFoundError } from '../utils/errors';
import { asyncHandler } from '../utils/middleware';
import { success } from '../utils/responses';
import { isNonEmptyString } from '../utils/validators';

const router = Router();

router.post('/register', asyncHandler(async (req, res) => {
	if (!isNonEmptyString(req.body.name))     { throw new InvalidParameterError('name');     }
	if (!isNonEmptyString(req.body.email))    { throw new InvalidParameterError('email');    }
	if (!isNonEmptyString(req.body.password)) { throw new InvalidParameterError('password'); }

	// Generate confirmation hash
	const buffer = await promisify(crypto.randomBytes)(20);
	const confirmationHash = buffer.toString('hex');

	// Generate password hash
	const passwordHash = await bcrypt.hash(req.body.password, 10);

	// Insert user
	const newUser = new User({
		admin: false,
		name: req.body.name,
		email: req.body.email,
		password: passwordHash,
		confirmed: false,
		confirmationHash
	});
	await newUser.save();

	// TODO: Send out confirmation email

	success(res);
}));

// /user/confirm?user=xxxxx&hash=xxxxx
router.get('/confirm', asyncHandler(async (req, res) => {
	if (!isNonEmptyString(req.query.user)) { throw new InvalidParameterError('user');              }
	if (!isNonEmptyString(req.query.hash)) { throw new InvalidParameterError('confirmation hash'); }

	// Get user
	const user = await User.findById(parseInt(req.query.user, 10));
	if (user === null) { throw new NotFoundError('User'); }

	// Check if hashes match
	if (user.confirmationHash !== req.query.hash) { throw new APIError('Confirmation hashes don\'t match.', 409); }

	user.confirmed = true;
	await user.save();

	success(res);
}));

router.post('/login', asyncHandler((req, res) => {
	// TODO
}));

export default router;
