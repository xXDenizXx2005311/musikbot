const Discord = require("discord.js")

module.exports = () => {
      const songEmbed = new Discord.MessageEmbed()
      .setTitle("Vibing Alone 😎")
      .setURL("https://withwin.in/dbd")
      .setImage("https://c.tenor.com/Wgo-XGZmUNAAAAAC/music-listening-to-music.gif")
			.setDescription('Soft Music x Shadow Bot, This bot is another experimental project of CTK')
			.setColor("GREEN")
			.setThumbnail("https://images.discordapp.net/avatars/636147614722555924/2e020703ae7e9ec152662c8c04d0cf0e.png?size=1024")
					
			const row = new Discord.MessageActionRow()
      .addComponents(new Discord.MessageButton()
        .setCustomId(`p_or_r`)
        .setEmoji("<:playpause:876035179242733579>")
        .setStyle("SECONDARY"))
      .addComponents(new Discord.MessageButton()
        .setCustomId(`stop`)
        .setEmoji("<:stop:876031930691379230>")
        .setStyle("SECONDARY"))
      .addComponents(new Discord.MessageButton()
        .setCustomId(`loop`)
        .setEmoji("<:loop:876031744980168704>")
        .setStyle("SECONDARY"))
      .addComponents(new Discord.MessageButton()
        .setCustomId(`volume`)
        .setEmoji(`<:volume:876126397909843970>`)
        .setStyle("SECONDARY")
        .setDisabled())
      .addComponents(new Discord.MessageButton()
        .setCustomId(`skip`)
        .setEmoji(`<:skip:876034463816097813>`)
        .setStyle("SECONDARY"))

    
    return { content: `**[ Song List ]**\nJoin a voice channel and queue songs by name or url in here.`, embeds: [ songEmbed ], components: [ row ] }
}