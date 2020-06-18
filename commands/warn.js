const Errors = require("../utils/errors");
const Discord = require("discord.js");
module.exports.run = async (bot, message, args, con) => {
  if (!message.member.hasPermission("MANAGE_MESSAGES")) {
    Errors.noPerms(message, "MANAGE_MESSAGES");
    return;
  }

  let user;
  if (message.mentions.users.first()) {
    user = message.mentions.users.first();
  } else {
    message.channel.send("Wie moet ik een waarschuwing geven?");
    return;
  }

  let reason = args.slice(1).join(" ");

  if (!reason) {
    message.channel.send("Geef een reden op");
    return;
  }

  message.channel.send(`Ik heb **${user}** gewaarschuwd voor: **${reason}**`);

  con.query(
    `SELECT * FROM warnings WHERE user_id = '${message.author.id}'`,
    (e, r) => {
      if (e) throw e;

      if (r.length === 0) {
        console.log("xd");
      }
    }
  );
};

module.exports.help = {
  name: "warn",
};
