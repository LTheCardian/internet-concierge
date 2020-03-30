const Discord = require('discord.js')
const errors = require('../utils/errors')
module.exports.run = async(bot, message, args, con) =>{
    if(message.author.bot) return
    if(!message.member.hasPermission('MANAGE_MESSAGE')){
        errors.noPerms(message, "MANAGE_MESSAGES")
    }else{
        ticket_name = args.join(" ")
        randomId = () => Math.floor(Math.random() * 900)

        console.log(randomId())

        con.query(`SELECT * FROM tickets WHERE ticket_name = '${ticket_name}'`, (e, r) =>{
            if(e) throw e
            if(r.length === 0 && ticket_name.length > 2){
                con.query(`INSERT INTO tickets(ticket_name, ticket_id) VALUES ('${ticket_name}', ${randomId()})`, e=>{
                    if(e) throw e
                    console.log(`${message.author.username} created ${ticket_name} with id: ${randomId()}`)
                    message.channel.send(`Je hebt **${ticket_name}** aangemaakt`)
                })
            }else if(r.length > 0){
                message.channel.send(`Ticket **${ticket_name}** bestaat al.`)
            }else{
                message.channel.send('Zorg dat je een geldige naam invoert die langer is dan 2 characters')
            }
        })
    }
}

module.exports.help ={
    name:"create_ticket"
}