const { list, insert, findOne, modify } = require('../services/User');
const eventEmitter = require('../scripts/events/eventEmitter');

const httpStatus = require('http-status');
const uuid = require('uuid');

const {
  passwordToHash,
  generateJWTAccessToken,
  generateJWTRefreshToken,
} = require('../scripts/utils/helper');

const index = (req, res) => {
  list()
    .then((response) => {
      if (!response)
        res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .send({ error: 'Something went wrong !' });
      res.status(httpStatus.OK).send(response);
    })
    .catch((e) => {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
    });
};

const create = (req, res) => {
  req.body.password = passwordToHash(req.body.password);
  insert(req.body)
    .then((response) => {
      if (!response)
        res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .send({ error: 'Something went wrong !' });
      res.status(httpStatus.CREATED).send(response);
    })
    .catch((e) => {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
    });
};

const login = (req, res) => {
  req.body.password = passwordToHash(req.body.password);
  findOne(req.body)
    .then((user) => {
      if (!user)
        return res
          .status(httpStatus.NOT_FOUND)
          .send({ message: 'User not found' });
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
};

const resetPassword = (req, res) => {
  const new_password =
    uuid.v4()?.split('-')[0] || `usr-${new Date().getTime()}`;

  modify({ email: req.body.email }, { password: passwordToHash(new_password) })
    .then((updatedUser) => {
      if (!updatedUser)
        return res.status(httpStatus.NOT_FOUND).send({ error: 'No such user' });
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
};

module.exports = {
  index,
  create,
  login,
  resetPassword,
};
