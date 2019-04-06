export default {
	port: 2400,
	postgres: {
		host: 'localhost',
		port: 5432,
		name: 'stem-summer-slide',
		username: '',
		password: ''
	},
	forceModelSync: false,
	mail: {
		host: '',
		port: 587,
		secure: false,
		auth: {
			user: '',
			password: ''
		}
	},
	jwtSecret: '',
	hostedOn: 'http://localhost:2400'
};
