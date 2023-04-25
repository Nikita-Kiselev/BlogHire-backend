import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import UserModel from "../models/User.js";

export const register = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10); // генерируются рандомные символы для утяжеления взлома пароля
    const hash = await bcrypt.hash(password, salt); // получаем зашифрованный пароль

    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash,
    });
    const user = await doc.save();
    const { passwordHash, ...userData } = user._doc; // убираем из  нашего ответа  пароль пользователя
    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      { expiresIn: "30d" }
    );
    res.json({
      userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось зарегистрироваться",
    });
  }
};
export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    //  Как мы поняли что пароль верный и подходит ли он к почте?
    //  Всё просто, в переменной user мы ищем в нашей бд челика с
    //  такой же почтой (ведь она уникальна), в случае если её нет,
    //  то работа всего приложения останавливается и выводит ошибку.
    //  В случае же если всё нашлось, то мы благодаря этой почте
    //  сможем найти профиль пользователя, в нем лежит хэш и прочая инфа

    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );


    if (!isValidPass) {
      console.log('Неверный логин или пароль');
      return res.status(404).json({
        message: "Неверный логин или пароль",
      });
    }

    const { passwordHash, ...userData } = user._doc;
    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      { expiresIn: "30d" } // перестанет работать через 30 дней
    );
    res.json({
      userData,
      token,
    });
  } catch (error) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось авторизоваться",
    });
  }
};
export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(403).json({
        message: "Нет доступа",
      });
    }

    const { passwordHash, ...userData } = user._doc;
    res.json({
      succsess: true,
      ...userData,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Нет доступа",
    });
  }
};
