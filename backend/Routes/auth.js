const express = require('express');
const User = require('../Models/User');
const router = express.Router()
const bcrypt = require("bcrypt")
const { check, validationResult } = require('express-validator');

// middleware that is specific to this router
const validatorArr = [
    check('name').trim().escape().notEmpty().withMessage('User name can not be empty!').bail().isLength({ min: 3 }).withMessage('Minimum 3 characters required!'),
    check('emailID').trim().normalizeEmail().notEmpty().withMessage('Invalid email address!').bail().isEmail().withMessage('Invalid email address!'),
    check('password').trim().escape().notEmpty().withMessage('Password can not be empty!').bail().isLength({ min: 8 }).withMessage('Minimum 8 characters required!')
]

// define the home page route
router.post('/signup', validatorArr, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { name, emailID, password } = req.body;

    // hashing password value (the salt is automatically generated by bcrypt)
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user object
    const newUser = new User({ name, emailID, password });
    newUser.password = hashedPassword;    

    // Save the user to the database
    newUser.save()
        .then((savedUser) => {
            // User created successfully
            return res.status(201).json({ message: 'User created successfully!' });
        })
        .catch((err) => {
            if (err.code === 11000) {
                // Email address already exists
                return res.status(400).json({ message: 'Email address already exists!' });
            } else {
                // Other error
                return res.status(500).json({ message: 'An error occurred while creating the user.', error: err });
            }
        });

})


module.exports = router