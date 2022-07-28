const { SlashCommandBuilder } = require("@discordjs/builders");
const Eval = require("open-eval");
const ev = new Eval();

module.exports = {
	data: {
		name: "shell-public",
	},
	async execute(client, interaction, MessageEmbed, Formatters, db) {
		const command = interaction.getTextInputValue("command");
		let inline = interaction.getTextInputValue("inline") || "n";
		let hidden = interaction.getTextInputValue("hidden") || "n";
		let embed;

		if (inline.toLowerCase() === "y") {
			inline = true;
		} else {
			inline = false;
		}

		function limit(value) {
			let max_chars = 700;
			let i;

			if (value.length > max_chars) {
				i = value.substr(0, max_chars);
			} else {
				i = value;
			}

			return i;
		}

		let results = await ev
			.eval("bash", command)
			.then(async (results) => {
				embed = new MessageEmbed()
					.setTitle("Bash Results")
					.setColor("RANDOM")
					.addField(
						"Input:",
						Formatters.codeBlock("bash", command),
						inline
					)
					.addField(
						"Output:",
						Formatters.codeBlock(
							"bash",
							limit(results.output || results.message)
						),
						inline
					)
					.addField("Version:", results.version, inline)
					.setFooter({
						iconURL: interaction.user.displayAvatarURL(),
						text: `Executed by ${
							interaction.user.username
						}, in about ${Math.floor(
							Date.now() - interaction.createdAt
						)} milliseconds`,
					});
			})
			.catch(async (error) => {
				embed = new MessageEmbed()
					.setTitle("Bash Results")
					.setColor("#FF0000")
					.addField(
						"Input:",
						Formatters.codeBlock("bash", limit(command)),
						inline
					)
					.addField(
						"Output:",
						Formatters.codeBlock("bash", limit(error)),
						inline
					)
					.setFooter({
						iconURL: interaction.user.displayAvatarURL(),
						text: `Executed by ${
							interaction.user.username
						}, in about ${Math.floor(
							Date.now() - interaction.createdAt
						)} milliseconds`,
					});
			});

		if (hidden.toLowerCase() === "y") {
			await interaction.deferReply({
				ephemeral: true,
			});
			await interaction.followUp({
				embeds: [embed],
				ephemeral: true,
			});
		} else {
			await interaction.reply({
				embeds: [embed],
			});
		}
	},
};
