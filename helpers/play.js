const Discord = require("discord.js")
const {
	AudioPlayerStatus,
	AudioResource,
	entersState,
	joinVoiceChannel,
	VoiceConnectionStatus,
} = require('@discordjs/voice');
const { Track } = require('../music/track');
const { MusicSubscription } = require('../music/subscription');
const ytsr = require("ytsr")
const { color } = require("../settings.json")
const db = require("quick.db")
const reset = require("../helpers/reset.js")

module.exports = async (median, song) => {
  let subscription = median.client.subscriptions.get(median.guildId);
  const data = db.get(`guild_${median.guildId}`)

  if(!song.includes("youtube.com")) song = await ytsr(song, { limit: 10 }).then(results => results.items.filter(x => x.type === 'video')[0].url)

  if (!subscription && median.member.voice.channel) {
				const channel = median.member.voice.channel;
				subscription = new MusicSubscription(
					joinVoiceChannel({
						channelId: channel.id,
						guildId: channel.guild.id,
						adapterCreator: channel.guild.voiceAdapterCreator,
					}),
				);
				subscription.voiceConnection.on('error', console.warn);
				median.client.subscriptions.set(median.guildId, subscription);
	}

	await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 20e3).catch(err => {
    console.warn(err)
    return;
  })

  const channel = median.guild.channels.cache.get(data.channelId) || await median.guild.channels.fetch(data.channelId).catch(err => {})
  const message = channel.messages.cache.get(data.messageId) || await channel.messages.fetch(data.messageId)


	    
	const track = await Track.from(song, {
    async onStart() {    
        const songEmbed = new Discord.MessageEmbed()
        .setTitle(track.title)
        .setURL(track.url)
        .setDescription(`[Youtube](https://www.youtube.com/channel/UClAFgotVhZ1DGvN57EMY7fA) | [Withwin](https://withwin.in/) | [Server](https://withwin.in/dbd) | [Github](https://github.com/)`)
        .setImage(track.thumbnail)
				.setColor(color[0])
				.setThumbnail(track.author.avatar)
        .setFooter(`${subscription.queue.length} songs | Volume 100% | Loop: ${subscription.loop ? 'Enabled' : 'Disabled'}`)
				
				
				message.edit({ content: `**[ Song List ]**\n${subscription.queue.filter((x, i) => i <= 4).map((x, i) => `**\`[ ${i + 1} ]\`** ${x.title}`).join("\n")} ${subscription.queue.length > 5 ? "\n**" + (subscription.queue.length - 5) + '** More Songs in queue..' : ''}`, embeds: [ songEmbed ] }).catch(console.warn);
			},
      async onFinish() {
					if(subscription.loop && subscription.voiceConnection.state.status !== 'destroyed') {
						subscription.enqueue(track);
						} else if(!subscription.queue.length) {
							if(subscription.voiceConnection.state.status !== 'destroyed') subscription.voiceConnection.destroy()
               message.edit(reset())
							median.client.subscriptions.delete(median.guildId);
					} 
				},
				onError(error) {
					console.warn(error);
				},
			});
      
      subscription.enqueue(track);
      message.embeds[0].footer = { text: `${subscription.queue.length} songs | Volume 100% | Loop: ${subscription.loop ? 'Enabled' : 'Disabled'}`}
      
      message.edit({ content: `**[ Song List ]**\n${subscription.queue.filter((x, i) => i <= 4).map((x, i) => `**\`[ ${i + 1} ]\`** ${x.title}`).join("\n")} ${subscription.queue.length > 5 ? "\n**" + (subscription.queue.length - 5) + '** More Songs in queue..' : ''}`, embeds: message.embeds}).catch(console.warn);
}