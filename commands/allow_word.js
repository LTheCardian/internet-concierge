const errors = require("../utils/errors.js");

module.exports.run = async (bot, message, args, con) => {
  if (!message.member.hasPermission("MANAGE_MESSAGES")) {
    errors.noPerms(message, "MANAGE_MESSAGES");
  } else {
    word = args.join(" ");

    con.query(`SELECT * FROM words WHERE banned="${word}"`, (e, r) => {
      if (e) throw e;
      if (r.length === 0) {
        message.channel.send("Dit woord staat niet in de database.");
      } else {
        con.query(`DELETE FROM words WHERE banned='${word}'`, (e) => {
          if (e) {
            console.error(e);
            message.channel.send(
              "Er is iets fout gegaan, probeer het later opnieuw"
            );
          } else {
            console.log(`${word} has been removed from the block list`);
            message.channel.send(
              `**${word}** is verwijderd van de lijst met geblokkeerde woorden`
            );
          }
        });
      }
    });
  }
};

module.exports.help = {
  name: "allow",
};
