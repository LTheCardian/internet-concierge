const Discord = require("discord.js");
const Errors = require("../utils/errors");
const { defaultMaxListeners } = require("snekfetch");
module.exports.run = async (bot, message, args, con) => {
  if (!message.member.hasPermission("MANAGE_MESSAGES")) {
    Errors.noPerms(message, "MANAGE_MESSAGES");
  }

  let exceptions = ["w"];

  let restore = [];
  if (message.author.bot) return;

  await clearChannel(message.channel);

  async function clearChannel(channel, n = 0, old = false) {
    let collected = await channel.fetchMessages({ limit: 100 });
    if (collected.size > 0) {
      while (collected.size >= 1) {
        collected.array().forEach((data) => {
          exceptions.forEach((exc) => {
            if (data.toString() === exc.toString()) {
              restore.push(exc);
            }
          });
        });
        let deleted = await channel.bulkDelete(100, true);
        console.log(deleted.size, collected.size);
        if (collected.size === 0) {
          console.log("yes");
          collected = await channel.fetchMessages({ limit: 100 });
          console.log(collected.size);
        }
        if (deleted.size === 0) {
          n = collected.array().length;
          let work = collected.array().concat(deleted.array());
          work.shift();
          let arr = work.toString();

          let embed = {
            color: 0x0099ff,
            title: "Cleared channel",
            description: "w1tch.pro test function",
            fields: [
              {
                name: "Deleted messages",
                value: arr,
              },
            ],
            timestamp: new Date(),
            footer: {
              text: message.author.username,
            },
          };

          await message.channel.send({ embed: embed });

          await message.channel.send("Messages will be restored momentarily");

          await restore.forEach((res) => {
            message.channel.send(res.toString());
          });
          break;
        }
      }
    }
  }
};

module.exports.help = {
  name: "del",
};
