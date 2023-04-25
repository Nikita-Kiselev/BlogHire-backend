import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";

import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from "./validations.js";

import { UserController, PostController } from "./controllers/index.js";
import { handleValidationErrors, checkAuth } from "./utils/index.js";

mongoose
  .connect(
    "mongodb+srv://Nikita:Nikita@cluster0.qy2t4sf.mongodb.net/node-blog?retryWrites=true&w=majority"
  )
  .then(() => console.log("DB ok"))
  .catch((err) => console.warn(err));

const app = express();
// storage для сохранения картинок
// когда будет выполняться хранилище
// ты должен будешь выполнить destination

// каждый раз когда пользователь будет загружать файл
// сначала выполняется функция destination (она возвращает путь)
// перед тем как этот файл сохранить мы получаем его имя (filename)
const storage = multer.diskStorage({
  destination: (_, __, callback) => {
    // здесь мы объясняем какой путь мы будем испльзовать
    callback(null, "uploads");
  },
  filename: (_, file, callback) => {
    callback(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use(cors()); // убираем ошибку с cors

app.use(express.json());
// если мы попытаемся получить картнику, то получим ошибку
// с помощью midleware (use) мы отлавливаем все запросы на
// путь /uploads, потом смотрим есть ли у нас в папке
// uploads то что нам передают (нам передают ссылку на картинку)

// express.static - понимает, что ты делаешь не просто GET запрос
// а ты делаешь GET запрос на получение статичного файла
app.use("/uploads", express.static("uploads"));

// Сначала мы выполняем авторизацию (пользователь вводит данные),
// loginValidation проверяет соответствуют ли данные требованиям,
// если нет, то сохраняет ошибку.
// Дальше мы заходим в handleValidationErrors, тут он проверяет,
// есть ли у нас ошибки в loginValidation, если да, то выводим 404 ошибку
app.post(
  "/auth/login",
  loginValidation,
  handleValidationErrors,
  UserController.login
);

app.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  UserController.register
);

app.get("/auth/me", checkAuth, UserController.getMe);

app.post(
  "/posts",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.create
);

app.delete("/posts/:id", checkAuth, PostController.remove);

app.patch(
  "/posts/:id",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update
);

app.get("/posts", PostController.getAll);

app.get("/posts/tags", PostController.getLastTags);

app.get("/posts/:id", PostController.getOne); // здесь у нас динамический адрес :id

app.get("/popularPosts", PostController.getPostsByPopularity);

app.get("/newPosts", PostController.getPostsByNew);

app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  res.json({
    // возвращаем пользователю ссылку на его картинку
    url: `/uploads/${req.file.originalname}`,
  });
});

app.listen(666, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("Server OK");
});
