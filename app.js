const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const soap = require("soap");
const app = express();
const port = 8080;

app.use(express.json());

const sequelize = new Sequelize(
  "postgres://postgres:admin@localhost:3000/testzd",
  {
    dialect: "postgres",
    logging: false,
  }
);

const Message = sequelize.define("Message", {
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

sequelize
  .sync()
  .then(async () => {
    console.log("Модель синхронизирована с базой данных");
    await Message.sync();
  })
  .catch((err) => {
    console.error("Ошибка синхронизации модели:", err);
  });

// получение всех сообщений
app.get("/messages", async (req, res) => {
  try {
    const messages = await Message.findAll();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// для создание нового сообщения
app.post("/messages", async (req, res) => {
  const newMessage = req.body;
  try {
    const message = await Message.create(newMessage);
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// обновление по айди
app.put("/messages/:id", async (req, res) => {
  const id = req.params.id;
  const updatedMessage = req.body;
  try {
    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json({ message: "Сообщение не найдено" });
    }
    await message.update(updatedMessage);
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// удаление по id
app.delete("/messages/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json({ message: "Сообщение не найдено" });
    }
    await message.destroy();
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

//для запросов соап
const service = {
  MessageService: {
    MessagePort: {
      getAllMessages: async function (args) {
        try {
          const messages = await Message.findAll();
          return { messages };
        } catch (err) {
          throw new Error("Ошибка получения сообщений");
        }
      },
      createMessage: async function (args) {
        const { content } = args;
        try {
          const message = await Message.create({ content });
          return { message };
        } catch (err) {
          throw new Error("Ошибка создания сообщения");
        }
      },
      updateMessage: async function (args) {
        const { id, content } = args;
        try {
          const message = await Message.findByPk(id);
          if (!message) {
            throw new Error("Сообщение не найдено");
          }
          await message.update({ content });
          return { message };
        } catch (err) {
          throw new Error("Ошибка обновления сообщения");
        }
      },
      deleteMessage: async function (args) {
        const { id } = args;
        try {
          const message = await Message.findByPk(id);
          if (!message) {
            throw new Error("Сообщение не найдено");
          }
          await message.destroy();
          return { message };
        } catch (err) {
          throw new Error("Ошибка удаления сообщения");
        }
      },
    },
  },
};

const xml = require("fs").readFileSync("message-service.wsdl", "utf8");
const soapOptions = {
  path: "/soap",
  services: service,
  xml: xml,
};

//создание
soap.listen(app, soapOptions);

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
