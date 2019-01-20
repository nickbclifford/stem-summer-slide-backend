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
	if (typeof req.body.user !== 'number') { throw new InvalidParameterError('user');              }
	if (!isNonEmptyString(req.body.hash))  { throw new InvalidParameterError('confirmation hash'); }

	// Get user
	const user = await User.findById(parseInt(req.body.user, 10));
	if (user === null) { throw new NotFoundError('User'); }

	// Check if hashes match
	if (user.confirmationHash !== req.body.hash) { throw new APIError('Confirmation hashes don\'t match.', 400); }

	user.confirmed = true;
	await user.save();

	success(res);
}));

router.post('/login', asyncHandler(async (req, res) => {
	if (!isNonEmptyString(req.body.email)) 	  { throw new InvalidParameterError('email');    }
	if (!isNonEmptyString(req.body.password)) { throw new InvalidParameterError('password'); }

	// Find user
	const user = await User.findOne({ where: { email: req.body.email }});
	if (user === null) { throw new NotFoundError('User'); }

	// Make sure passwords match
	if (!(await bcrypt.compare(req.body.password, user.password))) {
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
