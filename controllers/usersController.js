const _ = require('lodash');
const { User, validate } = require('../models/userModel');

exports.current_user_get = async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) return res.status(404).send('User not found.');

    return res.status(200).send(user);
};

exports.new_user_post = async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user;

    user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User already exists with this email.');

    user = new User(_.pick(req.body, ['name', 'email', 'password']));

    await user.hashPassword();
    await user.save();

    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email'])); // send token in HTML header so that it can be read by client and kept logged in
}

