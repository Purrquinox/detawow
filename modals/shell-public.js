const { SlashCommandBuilder } = require("@discordjs/builders");
const Eval = require("open-eval");
const ev = new Eval();

module.exports = {
	data: {
		name: "shell-public",
	},
	async execute(client, interaction, EmbedBuilder, Formatters, db) {
		const command = interaction.fields.getTextInputValue("command");
		let inline = interaction.fields.getTextInputValue("inline") || "n";
		let hidden = interaction.fields.getTextInputValue("hidden") || "n";
		let embed;

		if (inline.toLowerCase() === "y") inline = true;
		else inline = false;

		const limit = (value) => {
			let max_chars = 700;
			let i;

			if (value.length > max_chars) i = value.substr(0, max_chars);
			else i = value;

			return i;
		};

		let results = await ev
			.eval("bash", command)
			.then(async (results) => {
				embed = new EmbedBuilder()
					.setTitle("Bash Results")
					.setColor(0x00ff00)
					.addFields(
						{
							name: "Input:",
							value: Formatters.codeBlock("bash", limit(command)),
							inline: inline,
						},
						{
							name: "Output:",
							value: Formatters.codeBlock(
								"bash",
								limit(results.output || results.message)
							),
							inline: inline,
						},
						{
							name: "Version:",
							value: Formatters.codeBlock(
								"bash",
								limit(results.version)
							),
							inline: inline,
						}
					)
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
				embed = new EmbedBuilder()
					.setTitle("Bash Results")
					.setColor(0xff0000)
					.addFields(
						{
							name: "Input:",
							value: Formatters.codeBlock("bash", limit(command)),
							inline: inline,
						},
						{
							name: "Output:",
							value: Formatters.codeBlock("bash", limit(error)),
							inline: inline,
						}
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
