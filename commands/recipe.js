const { SlashCommandBuilder } = require("@discordjs/builders");
const axios = require("axios");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("recipe")
		.setDescription("Find a nice cooking recipe")
		.addStringOption((option) =>
			option
				.setName("query")
				.setDescription("What do you want to make?")
				.setRequired(true)
		),
	async execute(client, interaction, EmbedBuilder, Formatters, db) {
		const query = interaction.options.getString("query");

		const options = {
			method: "GET",
			url: "https://tasty.p.rapidapi.com/recipes/list",
			params: {
				q: encodeURIComponent(query),
				from: "0",
				size: "10",
			},
			headers: {
				"X-RapidAPI-Host": "tasty.p.rapidapi.com",
				"X-RapidAPI-Key": process.env.TASTY_API_KEY,
			},
		};

		axios
			.request(options)
			.then(async (response) => {
				let data = response.data.results;
				let desc = "";

				if (data === undefined) return;

				data.forEach(async (recipe) => {
					desc =
						desc +
						`- [${recipe.name}](https://tasty.co/recipe/${recipe.slug})\n`;
				});

				let embed = new EmbedBuilder()
					.setTitle(`Here are some recipes for ${query}`)
					.setColor(0x00ff00)
					.setDescription(desc || `No recipes found for ${query}`)
					.setFooter({
						iconURL: interaction.user.displayAvatarURL(),
						text: `Requested by ${interaction.user.username} | Powered by Tasty!`,
					});

				await interaction
					.reply({
						embeds: [embed],
					})
					.catch(async () => {
						await interaction.channel.send({
							embeds: [embed],
						});
					});
			})
			.catch(async (error) => {
				console.error(error);

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
			});
	},
};
