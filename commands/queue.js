module.exports.run = async (bot, message, args, ops) =>{
    var guildIDData = ops.active.get(message.guild.id)

    if(!guildIDData) return message.channel.send('Er zit geen muziek in de queue')

    var queue = guildIDData.queue
    var nowPlaying = queue[0]

    let response = `Nu aan het spelen ${nowPlaying.songTitle} || Aangevraagd door ${nowPlaying.requester}\n\nQueue: \n`

    for(var i =0; i < queue.length; i++ ){
        response += `$[i], ${queue[i].songTitle} Aangevraagd door ${queue[i].requester}\n`

    }

    message.channel.send(response)
}

module.exports.help ={
    name:'q'
}