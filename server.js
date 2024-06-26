const express = require('express');
const cors = require('cors');
const cookieSession = require('cookie-session');

require('dotenv').config();

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
	cookieSession({
		name: 'bezkoder-session',
		keys: [process.env.COOKIE_SECRET],
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

// simple route
app.get('/', (req, res) => {
	res.json({ message: `Welcome to Dan's user authorisation application.` });
});

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});

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
