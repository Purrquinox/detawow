const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionsBitField } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("setchannel")
		.setDescription("Set a channel for you to chat with me")
		.addChannelOption((option) =>
			option
				.setName("channel")
				.setDescription("The channel you want me to chat in")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("category")
				.setDescription("What do you want to talk about?")
				.setRequired(true)
				.addChoices(
					{ name: "Failure", value: "failure" },
					{ name: "Brain Damage (Default)", value: "brain_damage" },
					{ name: "Cupid (NSFW)", value: "cupid_nsfw" }
				)
		),
	async execute(client, interaction, EmbedBuilder, Formatters, db) {
		const channel = interaction.options.getChannel("channel");
		const category = interaction.options.getString("category");

		if (!interaction.member.permissions.has(PermissionsBitField.ManageServer)) return interaction.reply("You do not have permission to use this command!");
		
		if (category.endsWith("nsfw")) {
			if (!channel.nsfw) return interaction.reply("This category can only be used in NSFW channels!");
			else if (channel.nsfw) {
				db.aiChannels.add(channel.id, interaction.guild.id, category);

				interaction.reply({
					content: `You can now talk with me in the <#${channel.id}> channel!`
				})
			}
		} else {
			db.aiChannels.add(channel.id, interaction.guild.id, category);

			interaction.reply({
				content: `You can now talk with me in the <#${channel.id}> channel!`
			});
		}
	},
};
