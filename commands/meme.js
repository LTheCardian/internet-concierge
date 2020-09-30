const rp = require("random-puppy");

module.exports.run = async (bot, message, args) => {
  let reddit = [
    "okemakkermalloot",
    "gaMEMEneersubmissies",
    "tokkiefeesboek",
    "tokkiemarktplaats",
    "atheism",
    "cringeanarchy",
    "unpopularopinion",
    "gendercritical",
    "ice_poseidon2",
    "appiememes",
    "politiekememes",
    "FreekVonkmemes",
  ];
  let subreddit = reddit[Math.floor(Math.random() * reddit.length)];

  message.channel.startTyping();
  if (args.length > 0) {
    let subreddit = args.join(" ");

    if (subreddit) {
      rp(subreddit)
        .then(async (url) => {
          await message.channel
            .send({
              files: [
                {
                  attachment: url,
                  name: "grappig.png",
                },
              ],
            })
            .then(() => console.log("done"));
        })
        .catch((e) => console.error(e));
    }
  } else if (args.length <= 0) {
    rp(subreddit)
      .then(async (url) => {
        await message.channel
          .send({
            files: [
              {
                attachment: url,
                name: "uwu.png",
              },
            ],
          })
          .then(() => message.channel.stopTyping());
      })
      .catch((e) => console.error(e));
  } else {
    message.channel.send("Geef een subreddit op");
  }
};
module.exports.help = {
  name: "reddit",
};
