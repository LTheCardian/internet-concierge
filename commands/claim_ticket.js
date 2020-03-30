const Discord = require('discord.js')

module.exports.run = async(bot, message, args, con) =>{
    ticket_name = args.join(" ")

    con.query(`SELECT * FROM tickets where ticket_name = '${ticket_name}'`, (e, tickets)=>{
        if (e) throw e

        if(tickets.length === 0){
            message.channel.send(`Ticket **${ticket_name}** bestaat niet`)
            return
        }else{
            con.query(`SELECT * FROM groups`, (e, groups) =>{
                if(e) throw e

                if(groups.length === 0){
                    message.channel.send('Er zijn geen groepen in de database')
                }else{
                    con.query(`SELECT * FROM grouped WHERE member_id = '${message.author.id}'`, (e, r) =>{
                        if(e) throw e
                        if(r.length > 0){
                            con.query(`INSERT INTO c_tickets(group_id, group_name, ticket_id, ticket_name) VALUES ('${r[0].group_id}', '${r[0].group_name}', '${tickets[0].ticket_id}', '${ticket_name}')`, e =>{
                                if (e) throw e
        
                                console.log(`${message.author.username} heeft succesvol ${ticket_name} geclaimed`)
        
                                message.channel.send(`Je hebt successvol **${ticket_name}** geclaimed`)
                            })
                            con.query(`DELETE FROM tickets WHERE ticket_name = '${ticket_name}'`, e =>{
                                if(e) throw e
                                console.log(`Deleted ${ticket_name}`)
                            })
                        }else{
                            message.channel.send('Je moet in een groep zitten om een ticket te kunnen claimen.')
                        }
                    })
                }
            })
        }
    })
}

module.exports.help ={
    name:"claim_ticket"
}