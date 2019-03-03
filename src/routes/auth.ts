import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Router } from 'express';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import { promisify } from 'util';
import config from '../config';
import User from '../models/User';
import { APIError, InvalidParameterError, NotFoundError } from '../utils/errors';
import { asyncHandler } from '../utils/middleware';
import { success } from '../utils/responses';
import { isNonEmptyString } from '../utils/validators';

const router = Router();

router.post('/register', asyncHandler(async (req, res) => {
	const name = req.body.name;
	if (!isNonEmptyString(name)) { throw new InvalidParameterError('name'); }
	const email = req.body.email;
	if (!isNonEmptyString(email)) { throw new InvalidParameterError('email'); }
	const password = req.body.password;
	if (!isNonEmptyString(password)) { throw new InvalidParameterError('password'); }

	// Generate confirmation hash
	const buffer = await promisify(crypto.randomBytes)(20);
	const confirmationHash = buffer.toString('hex');

	// Generate password hash
	const passwordHash = await bcrypt.hash(password, 10);

	// Insert user
	const newUser = new User({
		admin: false,
		name,
		email,
		password: passwordHash,
		confirmed: false,
		confirmationHash
	});
	await newUser.save();

	// Send out confirmation email
	// TODO: Create proper email, fill out fields
	const transport = nodemailer.createTransport(config.mail);
	await transport.sendMail({
		from: '',
		to: newUser.email,
		subject: 'STEM Summer Slide - Confirm Email',
		html: ''
	});

	success(res);
}));

router.post('/confirm', asyncHandler(async (req, res) => {
	const userId = req.body.user;
	if (typeof userId !== 'number') { throw new InvalidParameterError('user ID'); }
	const hash = req.body.hash;
	if (!isNonEmptyString(hash)) { throw new InvalidParameterError('confirmation hash'); }

	// Get user
	const user = await User.findById(userId);
	if (user === null) { throw new NotFoundError('User'); }

	// Check if hashes match
	if (user.confirmationHash !== hash) { throw new APIError('Confirmation hashes don\'t match.', 400); }

	user.confirmed = true;
	await user.save();

	success(res);
}));

router.post('/login', asyncHandler(async (req, res) => {
	const email = req.body.email;
	if (!isNonEmptyString(email)) { throw new InvalidParameterError('email'); }
	const password = req.body.password;
	if (!isNonEmptyString(password)) { throw new InvalidParameterError('password'); }

	// Find user
	const user = await User.findOne({ where: { email }});
	if (user === null) { throw new NotFoundError('User'); }

	// Make sure passwords match
	if (!(await bcrypt.compare(password, user.password))) {
		throw new APIError('Credentials don\'t match.', 401);
	}

	// Issue JWT (have to fill out generics so TS gets the correct overload)
	const token = await promisify<object, jwt.Secret, jwt.SignOptions>(jwt.sign)({
		user: user.id,
		admin: user.admin
	}, config.jwtSecret, {
		expiresIn: '30 days'
	});

	success(res, { token });
}));

export default router;
