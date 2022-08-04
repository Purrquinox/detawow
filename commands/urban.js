const { SlashCommandBuilder } = require("@discordjs/builders");
const urban = require("urban-dictionary");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("urban")
		.setDescription("Search for Urban Dictionary definitions.")
		.addStringOption((option) =>
			option
				.setName("query")
				.setDescription("What do you want to search for?")
				.setRequired(true)
		),
	async execute(client, interaction, EmbedBuilder, Formatters, db) {
		const query = interaction.options.getString("query");

		if (!interaction.channel.nsfw)
			return interaction.reply(
				"This command can only be used in NSFW channels!"
			);

		urban.define(query, async (error, results) => {
			if (error) {
				let embed = new EmbedBuilder()
					.setTitle("brain damage")
					.setColor(0xff0000)
					.addFields({
						name: "Message",
						value: Formatters.codeBlock("javascript", error),
						inline: false,
					});

				await interaction.reply({
					embeds: [embed],
				});
			} else {
				let embed = new EmbedBuilder()
					.setTitle(results[0].word)
					.setURL(results[0].permalink)
					.setColor(0x00ff00)
					.addFields({
						name: "Definition",
						value: results[0].definition,
						inline: false,
					})
					.addFields({
						name: "Ratings",
						value: `Upvotes: ${results[0].thumbs_up} | Downvotes: ${results[0].thumbs_down}`,
						inline: false,
					});

				await interaction.reply({
					embeds: [embed],
				});
			}
		});
	},
};
