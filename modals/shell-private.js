const { SlashCommandBuilder } = require("@discordjs/builders");
const { exec } = require("child_process");

module.exports = {
	data: {
		name: "shell-private",
	},
	async execute(client, interaction, MessageEmbed, Formatters) {
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

		const clean = async (text) => {
			if (text && text.constructor.name == "Promise") text = await text;

			if (typeof text !== "string")
				text = require("util").inspect(text, {
					depth: 1,
				});

			text = text
				.replace(/`/g, "`" + String.fromCharCode(8203))
				.replace(/@/g, "@" + String.fromCharCode(8203));

			return text;
		};

		try {
			exec(command, async (err, stdout, stderr) => {
				const results = await clean(stdout);

				if (err) {
					embed = new MessageEmbed()
						.setTitle("Bash Results")
						.setColor("#FF0000")
						.addField(
							"Input:",
							Formatters.codeBlock("bash", command),
							inline
						)
						.addField(
							"Output:",
							Formatters.codeBlock("bash", limit(err)),
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
				} else {
					embed = new MessageEmbed()
						.setTitle("Bash Results")
						.setColor("#FF0000")
						.addField(
							"Input:",
							Formatters.codeBlock("bash", command),
							inline
						)
						.addField(
							"Results:",
							Formatters.codeBlock("bash", limit(results)),
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
				}
			});
		} catch (err) {
			embed = new MessageEmbed()
				.setTitle("Bash Results")
				.setColor("#FF0000")
				.addField(
					"Input:",
					Formatters.codeBlock("bash", command),
					inline
				)
				.addField(
					"Output:",
					Formatters.codeBlock("bash", limit(err)),
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
		}
	},
};
