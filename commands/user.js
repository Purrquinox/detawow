const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("user")
		.setDescription("Get information about a user.")
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription(
					"What user do you want to get information about?"
				)
				.setRequired(true)
		),
	async execute(client, interaction, EmbedBuilder, Formatters, db) {
		// Get the user
		const user = interaction.options.getUser("user");
		const data = await client.getUser(user.id);

		// Check if the user exists
		if (!data) return interaction.reply("I couldn't find that user.");

		// Badges
		const badges = data.otherData.badges;
		let badgeString = "";

		if (badges.length > 0) {
			for (let i = 0; i < badges.length; i++) {
				badgeString += `- ${badges[i]}\n`;
			}
		} else {
			badgeString = "No badges";
		}

		// Trusted
		const trusted = data.otherData.trusted;
		let trustedString = "";

		if (trusted === true) {
			trustedString = "Trusted";
		} else {
			trustedString = "Not trusted";
		}

		// Create embed
		const embed = new EmbedBuilder()
			.setTitle(
				`${data.discordData.username}#${data.discordData.discriminator}`
			)
			.setThumbnail(data.discordData.avatar_url)
			.setColor(0x00ff00)
			.addFields(
				{
					name: "Username",
					value: String(data.discordData.username),
					inline: false,
				},
				{
					name: "Discriminator",
					value: String(data.discordData.discriminator),
					inline: false,
				},
				{
					name: "User Bio",
					value: String(data.otherData.bio),
					inline: false,
				},
				{
					name: "User ID",
					value: String(data.discordData.id),
					inline: false,
				},
				{
					name: "Created At",
					value: String(`<t:${data.discordData.created_at}>`),
					inline: false,
				},
				{
					name: "DetaWow Badges",
					value: String(badgeString),
					inline: false,
				},
				{
					name: "DetaWow Ratelimit",
					value: String(`${data.otherData.ratelimit} seconds`),
					inline: false,
				},
				{
					name: "DetaWow Trusted",
					value: String(trustedString),
					inline: false,
				}
			);

		// Send embed
		interaction.reply({
			embeds: [embed],
		});
	},
};
