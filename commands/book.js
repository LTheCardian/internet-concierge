const {RichEmbed} = require('discord.js')
const snekfetch = require('snekfetch')
module.exports.run = async(bot, message,args) =>{
    try{
        const query = args.join(" ")
        if(query < 1) return message.channel.send('Welk boek moet ik opzoeken')
        const {body} = await snekfetch
            .get('https://www.googleapis.com/books/v1/volumes')
            .query({
                maxResults:1,
                q:query,
                maxAllowedMaturityRating: "not-mature",
                key:process.env.GOOGLE_API_KEY
            })
        const description = body.items[0].volumeInfo.description
        const descriptionfix = description.substr(0, 600);
        const embed = new RichEmbed()
            .setColor(0x00A2E8)
            .setTitle(body.items[0].volumeInfo.title)
            .addField("Auteur ", body.items[0].volumeInfo.authors)
            .addField("Uitgever ", body.items[0].volumeInfo.publisher)
            .addField("Aantal bladzijdes", body.items[0].volumeInfo.pageCount)
            .addField("Genre" , body.items[0].volumeInfo.categories.length ? body.items[0].volumeInfo.categories.join(', ') : '???')
            .addField("Beschrijving", body.items[0].volumeInfo.description ? descriptionfix : 'Geen beschrijving beschikbaar.')
            .addField("Kopen?:", body.items[0].volumeInfo.canonicalVolumeLink)
            .setThumbnail(body.items[0].volumeInfo.imageLinks.thumbnail);
        message.channel.send(embed)
    } catch (err) {
        console.log(err)
    }
}

module.exports.help ={
    name:'boek'
}