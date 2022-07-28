const { SlashCommandBuilder } = require("@discordjs/builders");
const { Permissions } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("setchannel")
		.setDescription("Set a channel for you to chat with me")
		.addChannelOption((option) =>
			option
				.setName("channel")
				.setDescription("The channel you want me to chat in")
				.setRequired(true)
		),
	async execute(client, interaction, MessageEmbed, Formatters, db) {
		const channel = interaction.options.getChannel("channel");
		if (!interaction.member.permissions.has("MANAGE_SERVER")) return;

		db.allowed_channels.add(channel.id);

		await interaction.reply({
			content: `You can now chat with me in <#${channel.id}>`,
		});
	},
};
