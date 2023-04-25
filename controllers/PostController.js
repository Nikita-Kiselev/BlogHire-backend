import PostModel from "../models/Post.js";

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find().populate("user").exec();
    // с помощью populate и exec мы связываем две таблицы posts и users
    // если написать без них то в поле user мы получим просто его id,
    // а так мы получим целый объект пользователя с которым мы
    // прямо сейчас можем взаимодействовать
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Не удалось выполнить",
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;
     PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 }, // увеличиваем просмотры на 1
      },
      {
        returnDocument: "after", // возвращаем обновлённый документ, если этого не сделать
        //  вернётся старое число просмотров,
        //  и новое получим только после ещё одного обновления
      },
      (err, doc) => {
        // четвёртым аргументом отлавливаем ошибки
        if (err) {
          console.error(err);
          return res.status(500).json({
            message: "Не удалось вернуть статью",
          });
        }
        if (!doc) {
          // если документ удалился вернёт undefined
          return res.status(404).json({
            message: "Статья не найдена",
          });
        }
        res.json(doc);
      }
    ).populate('user');
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Не удалось выполнить",
    });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;
    await PostModel.findOneAndDelete(
      {
        _id: postId,
      },
      (err, doc) => {
        if (err) {
          res.status(500).json({
            message: "Не удалось удалить статью",
          });
        }
        if (!doc) {
          // проверяем найдена ли статья
          res.status(404).json({
            message: "Статья не найдена",
          });
        }
        res.json({ success: true });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Не удалось удалить статью",
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = await new PostModel({
      title: req.body.title,
      text: req.body.text,
      tags: req.body.tags,
      imageUrl: req.body.imageUrl,
      user: req.userId,
    });
    const post = await doc.save();
    console.log(post);
    res.json(post);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Не получилось создать статью",
    });
  }
};

export const update = async (req, res) => {
  try {
    const postId = req.params.id;
    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        tags: req.body.tags,
        imageUrl: req.body.imageUrl,
        user: req.userId,
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Не получилось обновить статью",
    });
  }
};

export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(5).exec(); // получаем 5 постов

    const tags = posts
      .map((obj) => obj.tags)
      .flat()
      .slice(0, 5);

    res.json(tags);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Не удалось выполнить",
    });
  }
};

export const getPostsByPopularity = async (req, res) => {
  try {
    const posts = await PostModel.find().populate("user").exec();
    const popularPosts = posts.sort((a,b) => b.viewsCount - a.viewsCount);
    console.log(popularPosts, 'popular');
    res.json(popularPosts)
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Не удалось выполнить",
    });
  }
};

export const getPostsByNew = async (req, res) => {
  try {
    const posts = await PostModel.find().populate("user").exec();
    const newPosts = posts.sort((a,b) => b.createdAt - a.createdAt);
    console.log(newPosts, 'new posts');
    res.json(newPosts)
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Не удалось выполнить",
    });
  }
};