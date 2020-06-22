const Discord = require("discord.js");
const Errors = require("../utils/errors");

module.exports.run = async (bot, message, args, con) => {
  message.channel.fetchMessages().then((messages) => {
    message.channel.bulkDelete(messages);
    messagesDeleted = messages.array().length;

    message.channel.send(`Deleted ${messagesDeleted} messages`)

  });
};

module.exports.help = {
  name: "del",
};
