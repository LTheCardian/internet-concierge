const Discord = require("discord.js");
const fs = require("fs");
const bot = new Discord.Client({
  partials: Object.values(["MESSAGE", "CHANNEL"]),
});
const cheerio = require("cheerio");
const request = require("request");
const botconfig = require("./botconfig.json");

bot.commands = new Discord.Collection();
require("dotenv").config();
const mysql = require("mysql");
const schedule = require("node-schedule");
const con = mysql.createConnection(process.env.JAWSDB_URL);
const ytdl = require("ytdl-core");
const queue = new Map();
let prefix = botconfig.prefix;
const GLU = "687969872621469766";
const filter = ["kanker", "nazi", "hoer", "kkr"];
con.connect((e) => {
  if (e) throw e;
  console.log("Connected  database");
});
fs.readdir("./commands/", (err, files) => {
  if (err) console.log(err);
  let jsfile = files.filter((f) => f.split(".").pop() === "js");
  if (jsfile.length <= 0) {
    console.log("Couldn't find commands.");
    return;
  }

  jsfile.forEach((f, i) => {
    let props = require(`./commands/${f}`);
    console.log(`${f} loaded!`);
    bot.commands.set(props.help.name, props);
  });
});

bot.on("ready", async () => {
  console.log(`${bot.user.username} is on ${bot.guilds.size} servers`);
  bot.user.setActivity("nieuwe dingen in de maak ", {
    type: "PLAYING",
  });
});

bot.on("error", console.error);

bot.on("message", async (message) => {
  if (message.author.bot) return;
  if (message.channel.type === "dm") return;
  let prefixes = JSON.parse(fs.readFileSync("./prefixes.json", "utf8"));
  if (!prefixes[message.guild.id]) {
    prefixes[message.guild.id] = {
      prefixes: botconfig.prefix,
    };
  }
  let prefix = prefixes[message.guild.id].prefixes;
  if (!message.content.startsWith(prefix)) return;

  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

  let commandfile = bot.commands.get(cmd.slice(prefix.length));
  if (commandfile) commandfile.run(bot, message, args, con);
});

bot.on("guildMemberAdd", (member) => {
  console.log(member.guild.id);
  const channelG = member.guild.channels.find(
    (ch) => ch.id === "687969872621469845"
  );
  const mentionG = member.guild.channels.find((ch) => ch.name === "regels");
  const rollen = member.guild.channels.find((ch) => ch.name === "rollen");
  if (member.guild.id === GLU) {
    channelG.send(
      `Gegroet, **${member.user.username}**. Lees eerst even **${mentionG}** door en geef daarna je klas door in **${rollen}** `
    );
  }

  con.query(
    `SELECT * FROM ungrouped WHERE member_id = ${member.id}`,
    (err, results) => {
      if (err) throw err;
      if (results.length === 0) {
        con.query(
          `INSERT INTO ungrouped (member_id, member_name) VALUES ('${member.id}', '${member.user.username}')`,
          (e) => {
            if (e) throw e;
            console.log(
              `Successfully added ${member.user.username} to the database`
            );
          }
        );
      } else {
        return;
      }
    }
  );

  con.query(
    `SELECT * FROM studenten WHERE student_id =${member.id}`,
    (e, r) => {
      if (e) throw e;
      if (r.length === 0) {
        con.query(
          `INSERT INTO studenten (student_id, student_name) VALUES('${member.id}', '${member.user.username}')`,
          (e) => {
            if (e) throw e;
            console.log(
              `Successfully saved ${member.user.username} in the students table`
            );
          }
        );
      }
    }
  );

  con.query(
    `SELECT * FROM userlevels WHERE userID = ${member.id}`,
    (err, results) => {
      if (err) throw err;
      if (results.length === 0) {
        con.query(
          `INSERT INTO userlevels(userLevel, userId, userName) VALUES('1', '${member.id}', '${member.user.username}')`,
          (e) => {
            if (e) throw e;
            console.log(
              `Successfully added ${member.user.username} to the level table`
            );
          }
        );
      } else {
        return;
      }
    }
  );

  const guest = member.guild.roles.find((r) => r.name === "Nieuw Lid");

  member.addRole(guest).catch(console.error);
});

bot.on("guildMemberRemove", (member) => {
  if (member.guild.id === GLU) {
    let channel = member.guild.channels.find(
      (ch) => ch.id === "687969872621469845"
    );
    if (!channel) return;

    channel.send(`Oei, daar gaat **${member}** 😔`);
    console.log(`${member.user.username} just left the server`);
  } else {
    let channel = member.guild.channels.find(
      (ch) => ch.id === "689845318061391905"
    );
    if (!channel) return;

    channel.send(`Oei, daar gaat **${member}** 😔`);
  }
});

bot.on("message", (message) => {
  if (message.author.bot) return;

  con.query(
    `SELECT * FROM ungrouped WHERE member_id = ${message.author.id}`,
    (err, results) => {
      if (err) throw err;

      if (results.length === 0) {
        con.query(
          `INSERT INTO ungrouped (member_id, member_name) VALUES ('${message.author.id}', '${message.author.username}')`,
          (e) => {
            if (e) throw e;
            console.log(
              "Successfully added " +
                message.author.username +
                " to the database"
            );
          }
        );
      } else {
        return;
      }
    }
  );
});

bot.on("message", (message) => {
  if (message.author.bot) return;
  con.query(
    `SELECT * FROM studenten WHERE student_id = ${message.author.id}`,
    (e, r) => {
      if (e) throw e;
      if (r.length === 0) {
        con.query(
          `INSERT INTO studenten (student_id, student_name) VALUES('${message.author.id}', '${message.author.username}')`,
          (e) => {
            if (e) throw e;

            console.log(
              `Successfully added ${message.author.username} to the students table`
            );
          }
        );
      }
    }
  );
});

//roles

bot.on("message", (message) => {
  if (message.guild.id === GLU) {
    if (message.author.bot) return;
    if (message.channel.type === "dm") return;
    let args = message.content.substring(botconfig.prefix.length).split(" ");
    const member = message.member;
    const studenten = message.guild.roles.find((r) => r.name === "Studenten");
    switch (args[0]) {
      case "2MD1".toLowerCase():
        const _2md1 = message.guild.roles.find((r) => r.name === "2MD1");
        member.addRole(_2md1).catch(console.error);
        member.addRole(studenten).catch(console.error);
        message.channel
          .send(`Je bent nu lid van **${_2md1.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully added ${message.author.username} to ${_2md1.name}`
        );
        break;
      case "1WDV1".toLowerCase():
        const _1wdv1 = message.guild.roles.find((r) => r.name === "1WDV1");
        member.addRole(_1wdv1).catch(console.error);
        member.addRole(studenten).catch(console.error);
        message.channel
          .send(`Je bent nu lid van **${_1wdv1.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully added ${message.author.username} to ${_1wdv1.name}`
        );
        break;
      case "1WDV2".toLowerCase():
        const _1wdv2 = message.guild.roles.find((r) => r.name === "1WDV2");
        member.addRole(_1wdv2).catch(console.error);
        member.addRole(studenten).catch(console.error);
        message.channel
          .send(`Je bent nu lid van **${_1wdv2.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully added ${message.author.username} to ${_1wdv2.name}`
        );
        break;
      case "2MD2".toLowerCase():
        const _2md2 = message.guild.roles.find((r) => r.name === "2MD2");
        member.addRole(_2md2).catch(console.error);
        member.addRole(studenten).catch(console.error);
        message.channel
          .send(`Je bent nu lid van **${_2md2.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully added ${message.author.username} to ${_2md2.name}`
        );
        break;
      case "3MD1".toLowerCase():
        const _3md1 = message.guild.roles.find((r) => r.name === "3MD1");
        member.addRole(_3md1).catch(console.error);
        member.addRole(studenten).catch(console.error);
        message.channel
          .send(`Je bent nu lid van **${_3md1.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully added ${message.author.username} to ${_3md1.name}`
        );
        break;
      case "1WD1".toLowerCase():
        const _1wd1 = message.guild.roles.find((r) => r.name === "1WD1");
        member.addRole(_1wd1).catch(console.error);
        member.addRole(studenten).catch(console.error);
        message.channel
          .send(`Je bent nu lid van **${_1wd1.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully added ${message.author.username} to ${_1wd1.name}`
        );
        break;
      case "1WD2".toLowerCase():
        const _1wd2 = message.guild.roles.find((r) => r.name === "1WD2");
        member.addRole(_1wd2).catch(console.error);
        member.addRole(studenten).catch(console.error);
        message.channel
          .send(`Je bent nu lid van **${_1wd2.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully added ${message.author.username} to ${_1wd2.name}`
        );
        break;
      case "1WD3".toLowerCase():
        const _1wd3 = message.guild.roles.find((r) => r.name === "1WD3");
        member.addRole(_1wd3).catch(console.error);
        member.addRole(studenten).catch(console.error);
        message.channel
          .send(`Je bent nu lid van **${_1wd3.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully added ${message.author.username} to ${_1wd3.name}`
        );
        break;
      case "2WD1".toLowerCase():
        const _2wd1 = message.guild.roles.find((r) => r.name === "2WD1");
        member.addRole(_2wd1).catch(console.error);
        member.addRole(studenten).catch(console.error);
        message.channel
          .send(`Je bent nu lid van **${_2wd1.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully adeed ${message.author.username} to ${_2wd1.name}`
        );
        break;
      case "2WD2".toLowerCase():
        const _2wd2 = message.guild.roles.find((r) => r.name === "2WD2");
        member.addRole(_2wd2).catch(console.error);
        member.addRole(studenten).catch(console.error);
        message.channel
          .send(`Je bent nu lid van **${_2wd2.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully added ${message.author.username} to ${_2wd2.name}`
        );
        break;
      case "3IV1".toLowerCase():
        const _3iv1 = message.guild.roles.find((r) => r.name === "3IV1");
        member.addRole(_3iv1).catch(console.error);
        member.addRole(studenten).catch(console.error);
        message.channel
          .send(`Je bent nu lid van **${_3iv1.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully added ${message.author.username} to ${_3iv1.name}`
        );
        break;
      case "3IV2".toLowerCase():
        const _3iv2 = message.guild.roles.find((r) => r.name === "3IV2");
        member.addRole(_3iv2).catch(console.error);
        member.addRole(studenten).catch(console.error);
        message.channel
          .send(`Je bent nu lid van **${_3iv2.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully added ${message.author.username} to ${_3iv2.name}`
        );
        break;
      case "4IV1".toLowerCase():
        const _4iv1 = message.guild.roles.find((r) => r.name === "4IV1");
        member.addRole(_4iv1).catch(console.error);
        member.addRole(studenten).catch(console.error);
        message.channel
          .send(`Je bent nu lid van **${_4iv1.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully added ${message.author.username} to ${_4iv1.name}`
        );
        break;
      case "4IV2".toLowerCase():
        const _4iv2 = message.guild.roles.find((r) => r.name === "4IV2");
        member.addRole(_4iv2).catch(console.error);
        member.addRole(studenten).catch(console.error);
        message.channel
          .send(`Je bent nu lid van **${_4iv2.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully added ${message.author.username} to ${_4iv2.name}`
        );
        break;
      case "GIO".toLowerCase():
        const _gio = message.guild.roles.find((r) => r.name === "Gio");
        member.addRole(_gio).catch(console.error);
        message.channel
          .send(`Je bent nu lid van **${_gio.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully added ${message.author.username} to ${_gio.name}`
        );
        break;
      case "GLUBOT".toLowerCase():
        const glubot = message.guild.roles.find((r) => r.name === "GLUbot");
        member.addRole(glubot).catch(console.error);
        message.channel
          .send(`Je bent nu lid van **${glubot.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully added ${message.author.username} to ${glubot.name}`
        );
        break;
    }
  }
});

// bot.on("message", (message) => {
//   if (message.author.bot) return;
//   if (message.channel.type === "DM") return;
//   if (message.guild.id !== CMS && !message.content.includes("CM")) {
//     console.log("werkt");
//     return;
//   }
//   if (message.author.bot) return;
//   if (message.channel.type === "DM") return;
//   let args = message.content.substring(botconfig.prefix.length).split(" ");
//   const member = message.member;
//   const studenten = message.guild.roles.find((r) => r.name === "@student");
//   switch (args[0]) {
//     case "1CM1".toLowerCase():
//       const _1cm1 = message.guild.roles.find((r) => r.name === "1CM1");
//       member.addRole(_1cm1).catch(console.error);
//       member.addRole(studenten).catch(console.error);
//       message.channel
//         .send(`Je bent nu lid van **${_1cm1.name}**!`)
//         .then((m) => m.delete(6000));
//       console.log(
//         `Successfully added ${message.author.username} to ${_1cm1.name}`
//       );
//       break;
//     case "1CM2".toLowerCase():
//       const _1cm2 = message.guild.roles.find((r) => r.name === "1CM2");
//       member.addRole(_1cm2).catch(console.error);
//       message.channel
//         .send(`Je bent nu lid van **${_1cm2.name}**!`)
//         .then((m) => m.delete(6000));
//       member.addRole(studenten).catch(console.error);
//       console.log(
//         `Successfully added ${message.author.username} to ${_1cm2.name}`
//       );
//       break;
//     case "1CM3".toLowerCase():
//       const _1cm3 = message.guild.roles.find((r) => r.name === "1CM3");
//       member.addRole(_1cm3).catch(console.error);
//       message.channel
//         .send(`Je bent nu lid van **${_1cm3.name}**!`)
//         .then((m) => m.delete(6000));
//       member.addRole(studenten).catch(console.error);
//       console.log(
//         `Successfully added ${message.author.username} to ${_1cm3.name}`
//       );
//       break;
//     case "1CM4".toLowerCase():
//       const _1cm4 = message.guild.roles.find((r) => r.name === "1CM4");
//       member.addRole(_1cm4).catch(console.error);
//       message.channel
//         .send(`Je bent nu lid van **${_1cm4.name}**!`)
//         .then((m) => m.delete(6000));
//       member.addRole(studenten).catch(console.error);
//       console.log(
//         `Successfully added ${message.author.username} to ${_1cm4.name}`
//       );
//       break;
//     case "2CM1".toLowerCase():
//       const _2cm1 = message.guild.roles.find((r) => r.name === "2CM1");
//       member.addRole(_2cm1).catch(console.error);
//       message.channel
//         .send(`Je bent nu lid van **${_2cm1.name}**!`)
//         .then((m) => m.delete(6000));
//       member.addRole(studenten).catch(console.error);
//       console.log(
//         `Successfully added ${message.author.username} to ${_2cm1.name}`
//       );
//       break;
//     case "2CM2".toLowerCase():
//       const _2cm2 = message.guild.roles.find((r) => r.name === "2CM2");
//       member.addRole(_2cm2).catch(console.error);
//       message.channel
//         .send(`Je bent nu lid van **${_2cm2.name}**!`)
//         .then((m) => m.delete(6000));
//       member.addRole(studenten).catch(console.error);
//       console.log(
//         `Successfully added ${message.author.username} to ${_2cm2.name}`
//       );
//       break;
//     case "2CM3".toLowerCase():
//       const _2cm3 = message.guild.roles.find((r) => r.name === "2CM3");
//       member.addRole(_2cm3).catch(console.error);
//       message.channel
//         .send(`Je bent nu lid van **${_2cm3.name}**!`)
//         .then((m) => m.delete(6000));
//       member.addRole(studenten).catch(console.error);
//       console.log(
//         `Successfully added ${message.author.username} to ${_2cm3.name}`
//       );
//       break;
//     case "2CM4".toLowerCase():
//       const _2cm4 = message.guild.roles.find((r) => r.name === "2CM4");
//       member.addRole(studenten).catch(console.error);
//       member.addRole(_2cm4).catch(console.error);
//       message.channel
//         .send(`Je bent nu lid van **${_2cm4.name}**`)
//         .then((m) => m.delete(6000));
//       console.log(`Successfully added ${message.author.name} to ${_2cm4.name}`);
//       break;
//     case "3CM1".toLowerCase():
//       const _3cm1 = message.guild.roles.find((r) => r.name === "3CM1");
//       member.addRole(studenten).catch(console.error);
//       member.addRole(_3cm1).catch(console.error);
//       message.channel
//         .send(`Je bent nu lid van **${_3cm1.name}**`)
//         .then((m) => m.delete(6000));
//       console.log(`Successfully added ${message.author.name} to ${_3cm1.name}`);
//       break;
//     case "3CM2".toLowerCase():
//       const _3cm2 = message.guild.roles.find((r) => r.name === "3CM2");
//       member.addRole(studenten).catch(console.error);
//       member.addRole(_3cm2).catch(console.error);
//       message.channel
//         .send(`Je bent nu lid van **${_3cm2.name}**`)
//         .then((m) => m.delete(6000));
//       console.log(`Successfully added ${message.author.name} to ${_3cm2.name}`);
//       break;
//     case "3CM3".toLowerCase():
//       const _3cm3 = message.guild.roles.find((r) => r.name === "3CM3");
//       member.addRole(studenten).catch(console.error);
//       member.addRole(_3cm3).catch(console.error);
//       message.channel
//         .send(`Je bent nu lid van **${_3cm3.name}**`)
//         .then((m) => m.delete(6000));
//       console.log(
//         `Successfully added ${message.author.username} to ${_3cm3.name}`
//       );
//       break;
//   }
// });

bot.on("message", (message) => {
  let args = message.content.substring(botconfig.prefix.length).split(" ");
  let member = message.member;
  switch (args[0]) {
    case "2MD1".toLowerCase():
      if (member.roles.find((r) => r.name === "2MD1")) {
        const _2md1 = message.guild.roles.find((r) => r.name === "2MD1");
        member.removeRole(_2md1).catch(console.error);
        message.channel
          .send(`Ik heb deze rol bij je weggehaald: **${_2md1.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully added ${message.author.username} to ${_2md1.name}`
        );
      } else {
        return;
      }
      break;
    case "1WDV1".toLowerCase():
      if (member.roles.find((r) => r.name === "1WDV1")) {
        const _1wdv1 = message.guild.roles.find((r) => r.name === "1WDV1");
        member.removeRole(_1wdv1).catch(console.error);

        message.channel
          .send(`Ik heb deze rol bij je weggehaald: **${_1wdv1.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully added ${message.author.username} to ${_1wdv1.name}`
        );
      } else {
        return;
      }
      break;
    case "1WDV2".toLowerCase():
      if (member.roles.find((r) => r.name === "1WDV2")) {
        const _1wdv2 = message.guild.roles.find((r) => r.name === "1WDV2");
        member.removeRole(_1wdv2).catch(console.error);

        message.channel
          .send(`Ik heb deze rol bij je weggehaald: **${_1wdv2.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully added ${message.author.username} to ${_1wdv2.name}`
        );
      } else {
        return;
      }
      break;
    case "2MD2".toLowerCase():
      if (member.roles.find((r) => r.name === "2MD2")) {
        const _2md2 = message.guild.roles.find((r) => r.name === "2MD2");
        member.removeRole(_2md2).catch(console.error);

        message.channel
          .send(`Ik heb deze rol bij je weggehaald: **${_2md2.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully added ${message.author.username} to ${_2md2.name}`
        );
      } else {
        return;
      }
      break;
    case "3MD1".toLowerCase():
      if (member.roles.find((r) => r.name === "3MD1")) {
        const _3md1 = message.guild.roles.find((r) => r.name === "3MD1");
        member.removeRole(_3md1).catch(console.error);

        message.channel
          .send(`Ik heb deze rol bij je weggehaald: **${_3md1.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully added ${message.author.username} to ${_3md1.name}`
        );
      } else {
        return;
      }
      break;
    case "1WD1".toLowerCase():
      if (member.roles.find((r) => r.name === "1WD1")) {
        const _1wd1 = message.guild.roles.find((r) => r.name === "1WD1");
        member.removeRole(_1wd1).catch(console.error);

        message.channel
          .send(`Ik heb deze rol bij je weggehaald: **${_1wd1.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully removed ${message.author.username} to ${_1wd1.name}`
        );
      } else {
        return;
      }
      break;
    case "1WD2".toLowerCase():
      if (member.roles.find((r) => r.name === "1WD2")) {
        const _1wd2 = message.guild.roles.find((r) => r.name === "1WD2");
        member.removeRole(_1wd2).catch(console.error);

        message.channel
          .send(`Ik heb deze rol bij je weggehaald: **${_1wd2.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully added ${message.author.username} to ${_1wd2.name}`
        );
      } else {
        return;
      }
      break;
    case "1WD3".toLowerCase():
      if (member.roles.find((r) => r.name === "1WD3")) {
        const _1wd3 = message.guild.roles.find((r) => r.name === "1WD3");
        member.removeRole(_1wd3).catch(console.error);

        message.channel
          .send(`Ik heb deze rol bij je weggehaald: **${_1wd3.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully added ${message.author.username} to ${_1wd3.name}`
        );
      } else {
        return;
      }
      break;
    case "2WD1".toLowerCase():
      if (member.roles.find((r) => r.name === "2WD1")) {
        const _2wd1 = message.guild.roles.find((r) => r.name === "2WD1");
        member.removeRole(_2wd1).catch(console.error);

        message.channel
          .send(`Ik heb deze rol bij je weggehaald: **${_2wd1.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully removed ${message.author.username} to ${_2wd1.name}`
        );
      } else {
        return;
      }
      break;
    case "2WD2".toLowerCase():
      if (member.roles.find((r) => r.name === "2WD2")) {
        const _2wd2 = message.guild.roles.find((r) => r.name === "2WD2");
        member.removeRole(_2wd2).catch(console.error);

        message.channel
          .send(`Ik heb deze rol bij je weggehaald: **${_2wd2.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully removed ${message.author.username} to ${_2wd2.name}`
        );
      } else {
        return;
      }
      break;
    case "4IV1".toLowerCase():
      if (member.roles.find((r) => r.name === "4IV1")) {
        const _4iv1 = message.guild.roles.find((r) => r.name === "4IV1");
        member.removeRole(_4iv1).catch(console.error);

        message.channel
          .send(`Je bent nu lid van **${_4iv1.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully added ${message.author.username} to ${_4iv1.name}`
        );
      } else {
        return;
      }
      break;
    case "4IV2".toLowerCase():
      if (member.roles.find((r) => r.name === "4IV2")) {
        const _4iv2 = message.guild.roles.find((r) => r.name === "4IV2");
        member.removeRole(_4iv2).catch(console.error);

        message.channel
          .send(`Je bent nu lid van **${_4iv2.name}**`)
          .then((m) => m.delete(6000));
        console.log(
          `Successfully added ${message.author.username} to ${_4iv2.name}`
        );
      } else {
        return;
      }
      break;
  }
});

bot.on("message", (message) => {
  if (message.content === botconfig.prefix + "clear") {
    if (message.member.hasPermission("MANAGE_MESSAGES")) {
      message.channel.fetchMessages().then(
        (list = () => {
          message.channel.bulkDelete(list);
        }),
        (err = () => {
          message.channel.send("Nope");
        })
      );
    }
  }
});

bot.on("message", (message) => {
  if (message.guild.id === GLU) {
    const channelR = bot.channels.find((ch) => ch.id === "688720597005500467");
    if (message.author.bot) return;
    if (message.channel === channelR) {
      message.delete(5000);
      console.log(
        `I just deleted ${message.content} send ${message.author.username} in #rollen`
      );
    } else {
      return;
    }
  }
});

//level script

randomXP = () => {
  return Math.floor(Math.random() * 7) + 8;
};
bot.on("message", (message) => {
  if (message.author.bot) return;

  con.query(
    `SELECT * FROM userlevels WHERE userID = ${message.author.id}`,
    (err, results) => {
      if (err) throw err;
      if (results.length === 0) {
        con.query(
          `INSERT INTO userlevels (userID, userXP, userLevel, userName) VALUES ('${
            message.author.id
          }', ${randomXP()}, 1, '${message.author.username}')`,
          (err) => {
            if (err) throw err;
            console.log(
              `Successfully added ${message.author.username} to the database`
            );
          }
        );
      } else {
        con.query(
          `UPDATE userlevels SET userXP = ${
            results[0].userXP + randomXP()
          } WHERE userID = ${message.author.id}`,
          (err) => {
            if (err) throw err;
            console.log(`Successfully added xp to ${message.author.username}`);
          }
        );
      }

      user = message.author;

      if (results.length === 0) {
        return;
      } else {
        let curxp = `${results[0].userXP}`;
        let curLvl = `${results[0].userLevel}`;
        let nxtLvl = `${results[0].userLevel}` * 800;
        curxp = curxp + randomXP();
        if (nxtLvl <= `${results[0].userXP}`) {
          con.query(
            `UPDATE userlevels SET userLevel = ${
              results[0].userLevel + 1
            } WHERE userID = ${message.author.id}`,
            (err) => {
              if (err) throw err;
              console.log(`${message.author.username} just leveled up`);
            }
          );
          curLvl = `${results[0].userLevel}`;

          let lvlup = new Discord.RichEmbed()
            .setThumbnail(user.avatarURL)
            .setAuthor(user.username)
            .setTitle("Leveltje omhoog")
            .setColor("RANDOM")
            .addField("Nieuw leveltje", `${results[0].userLevel}`);

          const channelL = bot.channels.find(
            (ch) => ch.id === "687975218253135884"
          );

          if (message.author.bot) return;
          channelL.send(lvlup);
        }
      }
    }
  );
});

bot.on("messageDelete", async (message) => {
  const logs = message.guild.channels.find(
    (channel) => channel.name === "bot-log"
  );
  const entry = await message.guild
    .fetchAuditLogs({
      type: "MESSAGE_DELETE",
    })
    .then((audit) => audit.entries.first());
  let user = "";
  if (
    entry.extra.channel.id === message.channel.id &&
    entry.target.id === message.author.id &&
    entry.createdTimestamp > Date.now() - 5000 &&
    entry.extra.count >= 1
  ) {
    user = entry.executor.username;
  } else {
    user = message.author.username;
  }
  logs.send(
    `**${message.content}** was deleted in **${message.channel.name}** by **${user}**`
  );
  console.log(
    `${user} delete ${message.content} in ${message.channel.name} send by ${message.author.username}`
  );
});

bot.on("message", function (message) {
  var parts = message.content.split(" ");

  if (parts[0] === ".image") {
    image(message, parts);
  }
});

image = (message, parts) => {
  let search = parts.slice(1).join(" ");

  let options = {
    url: "http://results.dogpile.com/serp?qc=images&q=" + search,
    method: "GET",
    headers: {
      Accept: "text/html",
      "User-Agent": "Chrome",
    },
  };
  request(options, (error, response, responseBody) => {
    if (error) {
      return;
    }

    $ = cheerio.load(responseBody);
    var links = $(".image a.link");

    var urls = new Array(links.length)
      .fill(0)
      .map((v, i) => links.eq(i).attr("href"));
    if (!urls.length) {
      return;
    }

    message.channel.send(urls[0]);
    console.log(
      `${message.author.username} just requested an image for ${search}`
    );
  });
};

//data collection xqcM

bot.on("message", (message) => {
  con.query(
    `SELECT * FROM messages WHERE message_id = ${message.id}`,
    (e, r) => {
      if (e) throw e;
      if (
        message.content.includes(
          "heeft dit zojuist getweet: https://twitter.com/"
        )
      )
        return;
      if (
        r.length === 0 &&
        message.content.length > 1 &&
        !message.content.includes("")
      ) {
        con.query(
          `INSERT INTO messages(message_id, message_content, author, author_id, channel_name, channel_id) VALUES('${message.id}', '${message.content}', '${message.author.username}' , '${message.author.id}', '${message.channel.name}', '${message.channel.id}')`,
          (e) => {
            if (e) throw e;
            console.log(
              `Successfully added ${message.content} send by ${message.author.username} in the table`
            );
          }
        );
      } else if (message.content.length === 0) {
        console.log(
          `${message.content} send by ${message.author.username} wasn't long enough to save in the database`
        );
      }
    }
  );
  con.query(`SELECT * FROM messages`, (e, r) => {
    if (e) throw e;
    if (
      message.content.includes(
        "heeft dit zojuist getweet: https://twitter.com/"
      )
    )
      return;
    if (message.content.length > 1) {
      con.query(
        `UPDATE messages SET total_messages = ${r[0].total_messages + 1}`,
        (e) => {
          if (e) throw e;
          console.log(
            `Successfully updated total messages to ${r[0].total_messages}`
          );
        }
      );
    } else {
      console.log("Message not long enough");
    }
  });
});

//spam filter

// Geblokkeerde woorden
bot.on("message", (message) => {
  con.query(`SELECT * FROM words`, (e, r) => {
    if (e) throw e;
    if (message.author.bot) return;
    if (r.length === 0) {
      console.log("There are no banned words to add to the filter");
    }
    const logs = message.guild.channels.find(
      (channel) => channel.id === "687972977391697950"
    );
    const objects = Object.entries(r);
    const arrayOb = Object.entries(filter);
    for (const [id, word] of objects) {
      const banned_word = word.banned;
      if (filter.includes(banned_word)) {
        return;
      } else {
        filter.push(banned_word);
        console.log(filter);
        console.log(`added ${banned_word} to the filter`);
      }
      if (message.content.includes(banned_word)) {
        message.delete();
      }
    }

    for (const [id, word] of arrayOb) {
      con.query(`SELECT * FROM words WHERE banned ="${word}"`, (e, r) => {
        if (e) throw e;
        if (r.length === 0) {
          con.query(`INSERT INTO words(banned) VALUES('${word}')`, (e) => {
            if (e) {
              console.error(e);
            }
          });
        }
      });
    }
  });
});

bot.login(process.env.TOKEN);
