const jwt = require('jsonwebtoken');
const UnAuthorisedError = require('../errors/UnAuthorisedError');

const { JWT_SECRET } = require('../config');

module.exports = (req, res, next) => {
  const token = req.cookies.movieToken;

  let payload;
  try {
    // попытаемся верифицировать токен
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    // отправим ошибку, если не получилось
    next(new UnAuthorisedError('Необходима авторизация'));
  }
  // записываем пейлоуд в объект запроса
  req.user = payload;
  // пропускаем запрос дальше
  next();
};
