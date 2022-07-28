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
	async execute(client, interaction, MessageEmbed, Formatters, db) {
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
					let servings = recipe.num_servings;
					let time = null;

					if (servings === undefined) {
						servings = "Unknown";
					}

					if (
						recipe["total_time_tier"] === null ||
						recipe["total_time_tier"] === undefined
					) {
						// Do Nothing
					} else {
						time =
							`takes ${recipe["total_time_tier"].display_tier} to make`.toLowerCase();
					}

					desc =
						desc +
						`[${recipe.name}](https://tasty.co/recipe/${
							recipe.slug
						}) (${servings} servings - ${
							time || "Time tier is unknown"
						})\n`;
				});

				let embed = new MessageEmbed()
					.setTitle(`Here are some recipes for ${query}`)
					.setColor("RANDOM")
					.setDescription(desc)
					.setFooter("Powered by Tasty");

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

				let embed = new MessageEmbed()
					.setTitle("brain damage")
					.setColor("RANDOM")
					.addField(
						"Message",
						Formatters.codeBlock("javascript", error),
						false
					);

				await interaction.reply({
					embeds: [embed],
				});
			});
	},
};
