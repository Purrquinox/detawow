const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timeout')
		.setDescription('Prevent members from chatting in all channels!')
	    .addUserOption(option => option
			.setName('user')
			.setDescription('The user that you want to mute')
			.setRequired(true))
		.addStringOption(option => option
			.setName('minutes')
			.setDescription('How much minutes do you want to mute this user for?')
			.setRequired(true))
		.addStringOption(option => option
			.setName('reason')
			.setDescription('What is the reason for you muting this user?')
			.setRequired(false)),
	async execute(client, interaction, MessageEmbed, Formatters, db) {
		const user = interaction.options.getMember("user");
		const minutes = interaction.options.getString("minutes");
		const time = minutes * 60 * 1000;
		let reason = interaction.options.getString("reason");
		let embed;

		if (reason === undefined) reason = "No reason Specified!";

		if (!interaction.member.permissions.has(Permissions.FLAGS.TIMEOUT_MEMBERS)) return;
		
		user.timeout(time, reason).then(async () => {
			embed = new MessageEmbed()
			.setTitle("User Muted!")
			.setColor("RANDOM")
			.addField("User:", `${user.user.username}#${user.user.discriminator}`, false)
			.addField("Time:", `${minutes} minutes`, false)
			.addField("Reason:", reason, false);

			await interaction.reply({
				embeds: [embed]
			});
		}).catch(async (err) => {
			embed = new MessageEmbed()
			.setTitle("ERROR")
			.setColor("RANDOM")
			.addField("Message:", "Sorry, there was an error. This issue has been reported to the developer!", false);
			
			await interaction.reply({
				embeds: [embed]
			});
		});
	},
};