const {RichEmbed} = require('discord.js')

module.exports.run = async(bot, message, args, con) =>{
    con.query(`SELECT * FROM grouped WHERE member_id = '${message.author.id}'`, (e, r) =>{
        if(e) throw e
        if(r.length === 0){
            message.channel.send('Je zit nog niet in een groep.')
        }else{
            con.query(`SELECT * FROM c_tickets WHERE group_id = '${r[0].group_id}'`, (e, tickets)=>{
                if(e) throw e
                let sicon = message.guild.iconURL
                let info = new RichEmbed()
                    .setTitle(`Groep info **${message.author.username}**`)
                    .setThumbnail(sicon)
                    .addField(`groep id: ${r[0].group_id}`, `groep naam: ${r[0].group_name}`)
                    .addField(`member id: ${r[0].member_id}`, `member naam: ${r[0].member_name}`)
                    .addField(`claimed ticket id: ${tickets[0].ticket_id}`, `claimed ticket naam: ${tickets[0].ticket_name}`)
                    .setTimestamp()
                    .setFooter(`API latency is ${Date.now() - message.createdTimestamp} ms`, message.author.displayAvatarURL)
                message.channel.send(info)
            })

        }
    })
}

module.exports.help ={
    name:'groep'
}