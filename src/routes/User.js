//validations
//validate middleware
const express = require('express');
const { create, index, login, resetPassword } = require('../controllers/User');
const { createUser, createAdminUser, userLogin,resetPasswordValidation } = require('../validations/User');
const validate = require("../middlewares/validate");
//const authenticate = require('../middlewares/authenticate');
const authenticateAdmin = require("../middlewares/authenticateAdmin.js");

const router = express.Router();

router.route("/create-admin-user").post(validate(createAdminUser, "body"), create);
router.route("/login").post(validate(userLogin, "body"), login);

router.route('/').get(authenticateAdmin, index);
router.post('/', authenticateAdmin, validate(createUser, 'body'), create);

router.route("/reset-password").post(validate(resetPasswordValidation),resetPassword);

module.exports = router;
