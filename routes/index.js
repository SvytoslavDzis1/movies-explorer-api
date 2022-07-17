const express = require('express');
const usersRouter = require('./users');
const routerMovies = require('./movies');
const NotFoundError = require('../errors/NotFoundError');
const { login, createUser, signLogout } = require('../controllers/users');
const { validateLogin, validateRegister } = require('../middlewares/validation');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/signin', validateLogin, login);
router.post('/signup', validateRegister, createUser);
router.post('/signout', signLogout);
router.use(auth);// все роуты ниже этой строки будут защищены авторизацией
router.use('/', usersRouter);
router.use('/', routerMovies);
router.use((req, res, next) => {
  next(new NotFoundError('Ресурс не найден.'));
});

module.exports = router;
