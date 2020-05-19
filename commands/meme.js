const rp = require('random-puppy')

module.exports.run = async (bot, message, args) =>{

    let subreddit = args.join(" ")

    

    message.channel.startTyping()
    if(subreddit){
        rp(subreddit).then(async url =>{
            await message.channel.send({
                files:[{
                    attachment:url,
                    name:'uwu.png'
                }]
            }).then(() => message.channel.stopTyping())
        }).catch(e => console.error(e))
    }else{
        message.channel.send(`geef een subreddit op`)
    }
}
module.exports.help ={
    name:'meme'
}