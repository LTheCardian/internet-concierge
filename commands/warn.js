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
      `INSERT INTO warnings(user_name, user_id, warnings) VALUES('${user.username}', '${user.id}', 1)`,
      (e) => {
        if (e) {
          console.error(e);
          message.channel.send(
            "Er is een fout opgetreden, probeer het later opnieuw"
          );
        }
      }
    );

    if (r.length === 0) {
      return;
    } else if (r[0].warnings.length > 0 && r[0].warnings >= 1) {
      con.query(`UPDATE warnings SET warnings = ${r[0].warnings + 1} `);
    }
  });
};

module.exports.help = {
  name: "warn",
};
