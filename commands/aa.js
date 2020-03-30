const errors = require('../utils/errors')

module.exports.run = async(bot, message, args, con) =>{
    if(!message.member.hasPermission('MANAGE_MESSAGES')){
        errors.noPerms(message, 'MANAGE_MESSAGES')
    }else{
        agenda_name = args.join(" ")

        randomId = () =>{
            return Math.floor(Math.random() * 900)
        }

        con.query(`SELECT * FROM agenda WHERE agenda_name = '${agenda_name}'`, (e, r) =>{
            if(e) throw e
            if(r.length === 0 && agenda_name.length < 12){
                con.query(`INSERT INTO agenda(agenda_name, agenda_id) VALUES('${agenda_name}', ${randomId()})`, e =>{
                    if(e){
                        console.error(e)
                        message.channel.send('Er is iets fouts gegaan')
                    }else{
                        console.log(`${message.author.username} succesfully created ${agenda_name}`)
                        message.channel.send(`${agenda_name} is succesvol in mijn agenda gezet!`)
                    }
                })
            }else if(agenda_name.length > 12){
                message.channel.send('De naam van dit agenda punt is te lang!')
            }else{
                message.channel.send("Dit agenda punt bestaat al")
            }
        })
    }
}

module.exports.help = {
    name:'add_agenda'
}