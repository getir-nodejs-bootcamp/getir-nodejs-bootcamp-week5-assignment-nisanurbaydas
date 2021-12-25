//validations
//validate middleware
const User = require('../controllers/User');
const { createUser, createAdminUser, userLogin,resetPasswordValidation } = require('../validations/User');
const validate = require("../middlewares/validate");
//const authenticate = require('../middlewares/authenticate');
const authenticateAdmin = require("../middlewares/authenticateAdmin.js");

const express = require('express');

const router = express.Router();

router.route("/create-admin-user").post(validate(createAdminUser, "body"), User.create);
router.route("/login").post(validate(userLogin, "body"), User.login);

router.route('/').get(authenticateAdmin, User.index);
router.post('/', authenticateAdmin, validate(createUser, 'body'), User.create);

router.route("/reset-password").post(validate(resetPasswordValidation),User.resetPassword);

module.exports = router;
