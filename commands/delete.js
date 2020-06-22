const Discord = require("discord.js");
const Errors = require("../utils/errors");

module.exports.run = async (bot, message, args, con) => {
  if (!message.member.hasPermission("MANAGE_MESSAGES")) {
    Errors.noPerms(message, "MANAGE_MESSAGES");
  }

  if (message.author.bot) return;

  let messagesDeleted = await clearChannel(message.channel);

  message.channel.send("Number of deleted messages:" + messagesDeleted.length);

  async function clearChannel(channel, n = 0, old = false) {
    let collected = await channel.fetchMessages();
    if (collected.size > 0) {
      if (old) {
        for (let msg of collected.array()) {
          await msg.delete();
          n++;
        }
      } else {
        let deleted = await channel.bulkDelete(100, true);
        if (deleted.size < collected.size) old = true;
        n += deleted;
      }

      return n + (await clearChannel(channel, old));
    } else return 0;
  }
};

module.exports.help = {
  name: "del",
};
