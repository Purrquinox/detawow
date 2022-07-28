const { SlashCommandBuilder } = require("@discordjs/builders");
const { Permissions } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("untimeout")
		.setDescription("Allow timed-out members to chat in all channels!")
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("The user that you want to unmute")
				.setRequired(true)
		),
	async execute(client, interaction, MessageEmbed, Formatters, db) {
		const user = interaction.options.getMember("user");
		let embed;

		if (
			!interaction.member.permissions.has(
				Permissions.FLAGS.TIMEOUT_MEMBERS
			)
		)
			return;

		user.timeout(null)
			.then(async () => {
				embed = new MessageEmbed()
					.setTitle("User Unmuted!")
					.setColor("RANDOM")
					.addField(
						"User:",
						`${user.user.username}#${user.user.discriminator}`.toString(),
						false
					);

				await interaction.reply({
					embeds: [embed],
				});
			})
			.catch(async () => {
				embed = new MessageEmbed()
					.setTitle("ERROR")
					.setColor("RANDOM")
					.addField(
						"Message:",
						"Sorry, there was an error. This issue has been reported to the developer!",
						false
					);

				await interaction.reply({
					embeds: [embed],
				});
			});
	},
};
