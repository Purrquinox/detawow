const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionsBitField } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("timeout")
		.setDescription("Prevent members from chatting in all channels!")
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("The user that you want to mute")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("minutes")
				.setDescription(
					"How much minutes do you want to mute this user for?"
				)
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("reason")
				.setDescription("What is the reason for you muting this user?")
				.setRequired(false)
		),
	async execute(client, interaction, EmbedBuilder, Formatters, db) {
		const user = interaction.options.getMember("user");
		const minutes = interaction.options.getString("minutes");
		const time = minutes * 60 * 1000;
		let reason = interaction.options.getString("reason");
		let embed;

		if (reason === undefined) reason = "No Reason Specified!";

		if (
			!interaction.member.permissions.has(
				PermissionsBitField.Flags.ModerateMembers
			)
		)
			return interaction.reply(
				"You do not have permission to use this command!"
			);

		user.timeout(time, reason)
			.then(async () => {
				embed = new EmbedBuilder()
					.setTitle("User Muted!")
					.setColor(0x00ff00)
					.addFields(
						{
							name: "User:",
							value: `${user.user.username}#${user.user.discriminator}`,
							inline: false,
						},
						{
							name: "Time:",
							value: `${minutes} minutes`,
							inline: false,
						},
						{
							name: "Reason:",
							value: reason,
							inline: false,
						}
					);

				await interaction.reply({
					embeds: [embed],
				});
			})
			.catch(async (err) => {
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
