const express = require('express');
const cors = require('cors');
const cookieSession = require('cookie-session');
const serverless = require('serverless-http');
const router = express.Router();

require('dotenv').config();

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
	cookieSession({
		name: 'dan-session',
		keys: [process.env.JWT_SECRET],
		httpOnly: true,
	})
);

const db = require('./app/models');
const Role = db.role;

db.mongoose
	.connect(`${process.env.MONGO_CONNECTION_STRING}`, {})
	.then(() => {
		console.log('Successfully connect to MongoDB.');
		initial();
	})
	.catch((err) => {
		console.error('Connection error', err);
		process.exit();
	});

app.get('/', (req, res) => {
	res.json({ message: `Welcome to Dan's user authorisation application.` });
});

require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

const nodeEnv = process.env.NODE_ENV;

if (nodeEnv === 'development') {
	const PORT = 8080;
	app.use('/', router);
	app.listen(PORT, () => {
		console.log(`Server running locally on port ${PORT}`);
	});
} else if (nodeEnv === 'production') {
	app.use('/.netlify/functions/server', router);
	module.exports.handler = serverless(app);
} else {
	console.log(
		`Error: NODE_ENV must be set to either 'development' or 'production'.`
	);
}

async function initial() {
	try {
		const count = await Role.estimatedDocumentCount();
		if (count === 0) {
			await new Role({ name: 'user' }).save();
			console.log("added 'user' to roles collection");

			await new Role({ name: 'moderator' }).save();
			console.log("added 'moderator' to roles collection");

			await new Role({ name: 'admin' }).save();
			console.log("added 'admin' to roles collection");
		}
	} catch (err) {
		console.log('error', err);
	}
}
