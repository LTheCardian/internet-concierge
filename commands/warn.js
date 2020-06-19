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

  con.query(`SELECT * FROM warnings WHERE user_id = '${user.id}'`, (e, r) => {
    if (e) throw e;

    con.query(
      `INSERT INTO warnings(user_name, user_id, warning, reason) VALUES('${user.username}', '${user.id}', 1, '${reason}')`,
      (e) => {
        if (e) {
          console.error(e);
          message.channel.send(
            "Er is een fout opgetreden, probeer het later opnieuw"
          );
        }
      }
    );

    if (r[0].warning >= 1) {
      con.query(`UPDATE warnings SET warning =${r[0].warning + 1}`);
    }
  });
};

module.exports.help = {
  name: "warn",
};
