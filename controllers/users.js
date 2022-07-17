const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;
const User = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const DuplicateError = require('../errors/DuplicateError');
const UnAuthorisedError = require('../errors/UnAuthorisedError');

const CODE_OK_200 = 200;
const CODE_OK_201 = 201;
const MONGO_DUPLICATE_ERROR_CODE = 11000;

// Обработка ошибок в асинхронном коде. Async/await
exports.getUser = async (req, res, next) => {
  try {
    // Метод findById находит документ по заданному идентификатору id
    const user = await User.findById(req.user._id);
    res.status(CODE_OK_200).send(user);
  } catch (err) {
    next(err);
  }
};

exports.createUser = (req, res, next) => {
  const {
    email, password, name,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    }))
    .then((user) => {
      res.status(CODE_OK_201).send({ _id: user._id, email: user.email });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        // Обработка ошибки
        next(new BadRequestError('Произошла ошибка при заполнении обязательных полей'));
      } else if (err.code === MONGO_DUPLICATE_ERROR_CODE) {
        next(new DuplicateError('Пользователь с таким email уже зарегистрирован'));
      } else {
        next(err);
      }
    });
};


exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {

      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key', { expiresIn: '7d' });

      res.cookie('movieToken', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: false,
      });
      res.send({ message: 'Успешный вход' });
    })
    .catch((err) => {
      next(new UnAuthorisedError(err.message));
    });
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: req.body.name, email: req.body.email },
      { new: true, runValidators: true },
    );
    if (user) {
      res.status(CODE_OK_200).send(user);
    } else {
      throw new NotFoundError('Пользователь по указанному _id не найден.');
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new BadRequestError('Произошла ошибка при заполнении обязательных полей'));
    } else if (err.code === MONGO_DUPLICATE_ERROR_CODE) {
      next(new DuplicateError('Пользователь с таким email уже зарегистрирован'));
    } else {
      next(err);
    }
  }
};

exports.signLogout = (req, res) => {
  res.clearCookie('movieToken', {
    maxAge: 0,
    httpOnly: true,
    sameSite: false,
    // secure: true,
  })
    .status(200).send({ message: 'Cookie удалены' });
};
