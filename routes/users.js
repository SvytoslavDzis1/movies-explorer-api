const express = require('express');

const userRoutes = express.Router();

const { validateUserUpdate } = require('../middlewares/validation');

const {
  getUser, updateUser,
} = require('../controllers/users');

userRoutes.get('/users/me', getUser);
userRoutes.patch('/users/me', express.json(), validateUserUpdate, updateUser);

module.exports = userRoutes;
