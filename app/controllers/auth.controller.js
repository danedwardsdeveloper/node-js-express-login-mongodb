const db = require('../models');
const User = db.user;
const Role = db.role;

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
	const user = new User({
		username: req.body.username,
		email: req.body.email,
		password: bcrypt.hashSync(req.body.password, 8),
	});

	try {
		await user.save();

		if (req.body.roles) {
			const roles = await Role.find({
				name: { $in: req.body.roles },
			});

			user.roles = roles.map((role) => role._id);
			await user.save();
			res.send({ message: 'User was registered successfully!' });
		} else {
			const role = await Role.findOne({ name: 'user' });
			user.roles = [role._id];
			await user.save();
			res.send({ message: 'User was registered successfully!' });
		}
	} catch (err) {
		res.status(500).send({ message: err });
	}
};

exports.signin = async (req, res) => {
	try {
		const user = await User.findOne({
			username: req.body.username,
		})
			.populate('roles', '-__v')
			.exec();

		if (!user) {
			return res.status(404).send({ message: 'User Not found.' });
		}

		const passwordIsValid = bcrypt.compareSync(
			req.body.password,
			user.password
		);

		if (!passwordIsValid) {
			return res.status(401).send({ message: 'Invalid Password!' });
		}

		const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
			algorithm: 'HS256',
			allowInsecureKeySizes: true,
			expiresIn: 24 * 60 * 60,
		});

		const authorities = user.roles.map(
			(role) => 'ROLE_' + role.name.toUpperCase()
		);

		req.session.token = token;

		res.status(200).send({
			id: user._id,
			username: user.username,
			email: user.email,
			roles: authorities,
		});
	} catch (err) {
		res.status(500).send({ message: err });
	}
};

exports.signout = async (req, res) => {
	try {
		req.session = null;
		return res.status(200).send({ message: "You've been signed out!" });
	} catch (err) {
		this.next(err);
	}
};
