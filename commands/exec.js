const Discord = require('discord.js')
const {exec} = require('child_process')

module.exports.run = async(bot, message,args) =>{
    if(message.author.id !== '634039627744804875') return message.channel.send('Sorry, maar alleen Gio kan dit doen!')

    const code = args.join(' ')
    if(!code) return message.channel.send('Ik heb input nodig')

    exec(code,  (error, stdout, stderr) =>{
        const input = `\`\`\`Bash\n${code}\n\`\`\``
        if(error){
            let output = `\`\`\`Bash\n${error}\n\`\`\``;
            const embed = new Discord.RichEmbed()
                .setTitle('Execute')
                .addField(':inbox_tray: Input', input)
                .addField(':x: Error', output)
                .setColor(0x00A2E8)
            return message.channel.send(embed)
        }else{
            const output = stderr || stdout
            const output2 = `\`\`\`Bash\n${output}\n\`\`\``
            const embed = new Discord.RichEmbed()
                .setTitle('Execute')
                .addField(':inbox_tray: Input', input)
                .addField(':outbox_tray: Output', output2)
                .setColor(0x00A2E8)
            return message.channel.send(embed)
        }
    })
}

module.exports.help ={
    name:'exec'
}
