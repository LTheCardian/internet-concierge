const Discord = require('discord.js')

const bot = new Discord.Client()

const config = require('./botconfig.json')
const ytld = require('ytdl-core')

const prefix = config.prefix

var queue = new Map()

bot.on('ready', () =>{
  console.log(`I am ready! I am in ${bot.guilds.size} guilds`)
})

bot.on('message', async message =>{
  if(message.author.bot) return
  if(message.content.indexOf(prefix) !== 0) return

  const args = message.content.split(prefix.length).trim().split(/ +/g)
  const command = args.shift().toLowerCase()

  const serverQueue = queue.get(message.guild.id)

  if(command === 'play'){
    play(message, serverQueue)
  }
})

async function play(message, serverQueue){
  const args = message.content.split(" ")

  const voiceChannel = message.member.voiceChannel
  if(!voiceChannel) return message.reply('Je moet in een voice kanaal zitten!')
  const permission = voiceChannel.permissionsFor(message.client.user)
  if(!permission.has('CONNECT') || !permission.has('SPEAK')){
    return message.channel.send('Ik heb geen permissie om het voice kanaal te joinen')
  }

  const songInfo = await ytld.getInfo(args[1])
  const song ={
    title:songInfo.title, 
    url:songInfo.video_url
  }

  if(!serverQueue){
    const queueConstruct ={
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume:5,
      playing:true
    }

    queue.set(message.guild.id, queueConstruct)

    queueConstruct.songs.push(song)

    try{
      var connection = await voiceChannel.join()
      queueConstruct.connection = connection
      playSong(message.guild, queueConstruct.songs[0])
    }catch(err){
      console.log(err)
      queue.delete(message.guild.id)
      return message.channel.send('Er was een error tijdens het afspelen! ' + err)
    }
  }else{
    serverQueue.songs.push(song)
    return message.channel.send(`${song.title} is toegevoegd aan de wachtrij`)
  }
}


function playSong(guild, song){
  const serverQueue = queue.get(guild.id)
  
  if(!song){
    serverQueue.voiceChannel.leave()
    queue.delete(guild.id)
    return
  }

  const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
    .on('end', ()=>{
      serverQueue.songs.shift()
      playSong(guild, serverQueue.songs[0])
    })
    .on('error', error =>{
      console.log(error)
    })

  dispatcher.setVolumeLogarithmic(serverQueue.volume /5)
}

bot.login(process.env.TOKEN)