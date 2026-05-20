import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User exists' });

    const user = await User.create({ name, email, password });
    res.status(201).json({ _id: user._id, name: user.name, token: generateToken(user._id) });
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        res.json({ _id: user._id, name: user.name, token: generateToken(user._id) });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};