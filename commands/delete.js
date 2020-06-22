const Discord = require("discord.js");
const Errors = require("../utils/errors");
const { defaultMaxListeners } = require("snekfetch");

module.exports.run = async (bot, message, args, con) => {
  if (!message.member.hasPermission("MANAGE_MESSAGES")) {
    Errors.noPerms(message, "MANAGE_MESSAGES");
  }

  if (message.author.bot) return;

  await clearChannel(message.channel);

  async function clearChannel(channel, n = 0, old = false) {
    let collected = await channel.fetchMessages({ limit: 5 });
    if (collected.size > 0) {
      while (collected.size >= 1) {
        let deleted = await channel.bulkDelete(3, true);
        console.log(deleted.size, collected.size);
        if (collected.size <= 3) {
          console.log("yes");
          collected = await channel.fetchMessages({ limit: 5 });

          console.log(collected.size);
        }
      }
    }
    return n + (await clearChannel(channel, old));
  }
};

module.exports.help = {
  name: "del",
};
