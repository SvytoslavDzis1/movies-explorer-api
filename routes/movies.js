const express = require('express');

const movieRoutes = express.Router();
const { validateMovie, validateMovieId } = require('../middlewares/validation');
const { getMovies, addMovie, deleteMovie } = require('../controllers/movies');

movieRoutes.get('/movies', getMovies);
movieRoutes.post('/movies', express.json(), validateMovie, addMovie);
movieRoutes.delete('/movies/:_id', validateMovieId, deleteMovie);

module.exports = movieRoutes;
