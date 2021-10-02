/**
 * Import Modules
 */
const Discord = require("discord.js"),
  fs = require("fs"),
  client = new Discord.Client({ intents: ['GUILD_VOICE_STATES', 'GUILD_MESSAGES', 'GUILDS'] }),
  { token, color } = require("./settings.json"),
  db = require("quick.db"),
  play = require("./helpers/play.js"),
  reset = require("./helpers/reset.js")

/**
 * Required Values
 */
client.subscriptions = new Map()

client.on('ready', () => console.log(`${client.user ?.username} is connected to discord!`));

client.on('messageCreate', async (message) => {
  if (!message.guild || message.author.bot) return;
  if (!client.application ?.owner) await client.application ?.fetch();
  const database = db.get(`guild_${message.guild.id}`)

  if (database && message.channel.id === database.channelId) {
    if(!message.member.voice.channel) return message.reply(`😐 | Please join the voice channel to vibe with me.`)
    .then(msg => setTimeout(() => {
      msg.delete() 
      message.delete()
      }, 10000))

    message.react("🎶")
    await play(message, message.content).catch(err => { console.log(err) })
    message.delete()
  }
  
  if (message.content.startsWith("!setup") && message.author.id === message.guild.ownerId) {
    let channel = message.mentions.channels.first()
    if (!channel) channel = await message.guild.channels.create("soft-shadow-music")

    const msg = await channel.send(reset())
    db.set(`guild_${message.guild.id}`, { channelId: channel.id, messageId: msg.id })
    return message.channel.send(`✅ | Setup completed, Now you can chill out!`)
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.guildId) return;
  let subscription = client.subscriptions.get(interaction.guildId);
  if (interaction.isButton()) {
    if (!subscription || !interaction.member.voice.channel) return;
    if (interaction.customId === 'p_or_r') {
      interaction.message.components[0].components[0].style = subscription.audioPlayer.state.status === 'paused' ? "SECONDARY" : "PRIMARY" 
      subscription.audioPlayer.state.status === 'paused' ? subscription.audioPlayer.unpause() : subscription.audioPlayer.pause();
      interaction.update({ components: interaction.message.components })
    } else if (interaction.customId === 'stop') {
      subscription.voiceConnection.destroy();
      client.subscriptions.delete(interaction.guildId);
      interaction.reply({ embeds: [ { description: `🤚 | **${interaction.member.user.username}** stoped the bot from playing music`, color: color[0] }]})
      setTimeout(function() { interaction.deleteReply() }, 5000)
    } else if (interaction.customId === 'skip') {
      subscription.audioPlayer.stop();
      interaction.reply({ embeds: [{ description: `⏩ | **${interaction.member.user.username}** skipped the song`, color: color[0] }] })
      setTimeout(function() { interaction.deleteReply() }, 5000)
    } else if (interaction.customId === 'loop') {
      subscription.loop = subscription.loop ? false : true
      interaction.message.components[0].components[2].style = subscription.loop ? "PRIMARY" : "SECONDARY"
      interaction.message.embeds[0].footer = { text: `${subscription.queue.length} songs | Volume 100% | Loop: ${subscription.loop ? 'Enabled' : 'Disabled'}` }
      interaction.update({ embeds: interaction.message.embeds, components: interaction.message.components })
    }
  }
});


client.login(token)
