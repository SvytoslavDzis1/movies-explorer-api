const Movie = require('../models/movie');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const BadRequestError = require('../errors/BadRequestError');

const CODE_OK_200 = 200;

exports.getMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({});
    res.status(CODE_OK_200).send(movies);
  } catch (err) {
    next(err);
  }
};

exports.addMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner: req.user._id,
  }).then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при сохранении фильма!'));
      } else {
        next(err);
      }
    });
};

exports.deleteMovie = async (req, res, next) => {
  try {
    const deletedMovie = await Movie.findById(req.params._id);
    if (deletedMovie) {
      if (req.user._id.toString() === deletedMovie.owner._id.toString()) {
        await Movie.findByIdAndRemove(req.params._id);
        res.status(CODE_OK_200).send({ deletedMovie });
      } else {
        throw new ForbiddenError('Недостаочно прав для удаления данного фильма');
      }
    } else {
      throw new NotFoundError('Фильм с указанным _id не найден.');
    }
  } catch (err) {
    if (err.name === 'CastError') {
      next(new BadRequestError('Ошибка удаления фильма'));
    } else {
      next(err);
    }
  }
};
