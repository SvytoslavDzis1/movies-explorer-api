const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { errors } = require('celebrate');
const helmet = require('helmet');
const { limiter } = require('./middlewares/rate-limiter');
const { MONGO_URL } = require('./config');
const InternalServerError = require('./errors/InternalServerError');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const router = require('./routes');

const app = express();

const { PORT = 3001 } = process.env;

app.use(express.json());

app.use(cors({
  origin: [
    'http://localhost:3002',
    'http://localhost:3000',
    'http://api.svatoslav.nomoredomains.work',
    'https://api.svatoslav.nomoredomains.work',
    'http://svatoslav.nomoredomains.work',
    'https://svatoslav.nomoredomains.work',
  ],
  methods: ['OPTIONS', 'GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'origin', 'Authorization'],
  credentials: true,
}));

app.use(helmet());
app.use(requestLogger);
app.use(limiter);
app.use(cookieParser());

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.use(router);
app.use(errorLogger); // подключаем логгер ошибок
mongoose.connect(MONGO_URL, { useNewUrlParser: true });
app.use(errors());
app.use(InternalServerError);

app.listen(PORT);
