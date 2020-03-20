module.exports.run = async(bot, message, args)=>{
    if(!message.member.voiceChannel) return message.channel.send('Je moet in een spraak kanaal zitten.')
    if(!message.guild.me.voiceChannel) return message.channel.send('Ik zit niet in een spraak kanaal')
    if(message.guild.me.voiceChannelID !== message.member.voiceChannelID) return message.channel.send('We zitten niet in hetzelfde kanaal')

    message.guild.me.voiceChannel.leave()

    message.channel.send('Ik heb het kanaal verlaten')
}

module.exports.help ={
    name:"leave"
}