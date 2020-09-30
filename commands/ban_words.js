const errors = require("../utils/errors");

module.exports.run = async (bot, message, args, con) => {
  if (!message.member.hasPermission("MANAGE_MESSAGES")) {
    errors.noPerms(message, "MANAGE_MESSAGES");
  } else {
    word = args.join(" ");

    con.query(`SELECT * FROM words WHERE banned = '${word}'`, (e, r) => {
      if (e) throw e;
      if (r.length === 0 && word.length <= 12) {
        con.query(`INSERT INTO words(banned) VALUES('${word}')`, (e) => {
          if (e) {
            console.error(e);
            message.channel.send(
              "Er is iets fout gegaan, probeer het later opnieuw"
            );
          } else {
            console.log(
              `${word} has been successfully added to the block list`
            );
            message.channel.send(
              `ik heb **${word}** toegevoegd aan de lijst met geblokkeerde woorden`
            );
          }
        });
      }
    });
  }
};

module.exports.help = {
  name: "block",
};
