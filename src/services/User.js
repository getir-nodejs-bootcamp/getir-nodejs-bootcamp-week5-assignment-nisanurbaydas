const User = require('../models/User');

const list = () => {
  return User.find({});
};

const insert = (data) => {
  const user = new User(data);
  return user.save();
};

const findOne = (where) => {
  return User.findOne(where);
};

// const deleteDoc = () => {}

const modify = (where, data) => {
  return User.findOneAndUpdate(where, data, { new: true });
};

module.exports = {
  list,
  insert,
  findOne,
  modify,
};
