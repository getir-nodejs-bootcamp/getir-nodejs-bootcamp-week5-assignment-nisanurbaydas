const { list, insert, findOne, modify } = require('../services/User');
const UserService = require('../services/UserService');
const eventEmitter = require('../scripts/events/eventEmitter');
const ApiError = require("../errors/ApiError");

const httpStatus = require('http-status');
const uuid = require('uuid');

const {
  passwordToHash,
  generateJWTAccessToken,
  generateJWTRefreshToken,
} = require('../scripts/utils/helper');

class UserController {
  index(req, res) {
    UserService.list()
      .then((response) => {
        if (!response) return next(new ApiError('Problem occured'));
        res.status(httpStatus.OK).send(response);
      })
      .catch((e) => {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
      });
  }
  create(req, res) {
    req.body.password = passwordToHash(req.body.password);
    UserService.create(req.body)
      .then((response) => {
        if (!response) return next(new ApiError('Something went wrong'));
        res.status(httpStatus.CREATED).send(response);
      })
      .catch((e) => {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
      });
  }
  login(req, res) {
    req.body.password = passwordToHash(req.body.password);
    UserService.findOne(req.body)
      .then((user) => {
        if (!user)
          return next(new ApiError('User not found', httpStatus.NOT_FOUND));
        user = {
          ...user.toObject(),
          tokens: {
            access_token: generateJWTAccessToken(user),
            refresh_token: generateJWTRefreshToken(user),
          },
        };
        delete user.password;
        res.status(httpStatus.OK).send(user);
      })
      .catch((e) => res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e));
  }
  resetPassword(req, res) {
    const new_password =
      uuid.v4()?.split('-')[0] || `usr-${new Date().getTime()}`;

    UserService.updateWhere(
      { email: req.body.email },
      { password: passwordToHash(new_password) }
    )
      .then((updatedUser) => {
        if (!updatedUser)
          return next(new ApiError('No such user', httpStatus.NOT_FOUND));
        eventEmitter.emit('send_email', {
          to: updatedUser.email,
          subject: 'Reset Password',
          html: `User password has been changed. <br />Your new password -> ${new_password}`,
        });
        res
          .status(httpStatus.OK)
          .send({ message: 'Required information is sent your e-mail' });
      })
      .catch(() =>
        res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .send({ error: "Something went wrong while resetting password'" })
      );
  }
}

module.exports = new UserController();
