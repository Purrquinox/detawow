const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionsBitField } = require("discord.js");

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
	async execute(client, interaction, EmbedBuilder, Formatters, db) {
		const user = interaction.options.getMember("user");
		let embed;

		if (
			!interaction.member.permissions.has(
				PermissionsBitField.Flags.ModerateMembers
			)
		)
			return interaction.reply(
				"You do not have permission to use this command!"
			);

		user.timeout(null)
			.then(async () => {
				embed = new EmbedBuilder()
					.setTitle("User Unmuted!")
					.setColor(0x00ff00)
					.addFields({
						name: "User:",
						value: `${user.user.username}#${user.user.discriminator}`.toString(),
						inline: false,
					});

				await interaction.reply({
					embeds: [embed],
				});
			})
			.catch(async () => {
				embed = new EmbedBuilder()
					.setTitle("ERROR")
					.setColor(0xff0000)
					.addFields({
						name: "Message:",
						value: "Sorry, there was an error. This issue has been reported to the developer!",
						inline: false,
					});

				await interaction.reply({
					embeds: [embed],
				});
			});
	},
};
