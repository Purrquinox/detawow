const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: {
		name: "eval-private",
	},
	async execute(client, interaction, EmbedBuilder, Formatters, db) {
		const code = interaction.fields.getTextInputValue("code");
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
			let evaled = eval(code);
			let results = await clean(evaled);
			let type = typeof evaled;
			let typeOf = type.charAt(0).toUpperCase() + type.slice(1);

			const tree = (obj) => {
				const data = [];

				if (obj === undefined || obj === null) {
					data.push(`${obj}`);
				}

				while (obj) {
					data.push(obj.constructor.name);
					obj = Object.getPrototypeOf(obj);
				}

				return data.reverse().join(" -> ");
			};

			embed = new EmbedBuilder()
				.setTitle("Evaluation Results")
				.setColor(0x00ff00)
				.addFields(
					{
						name: "Input:",
						value: Formatters.codeBlock("javascript", limit(code)),
						inline: inline,
					},
					{
						name: "Output:",
						value: Formatters.codeBlock(
							"javascript",
							limit(results)
						),
						inline: inline,
					},
					{
						name: "Type:",
						value: Formatters.codeBlock("javascript", typeOf),
						inline: inline,
					},
					{
						name: "Prototype:",
						value: Formatters.codeBlock("javascript", tree(evaled)),
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

			db.eval_private.replace({
				input: code,
				output: results,
				type: typeOf,
				modal: tree(evaled),
			});
		} catch (err) {
			embed = new EmbedBuilder()
				.setTitle("Evaluation Results")
				.setColor(0xff0000)
				.addFields(
					{
						name: "Input:",
						value: Formatters.codeBlock("javascript", limit(code)),
						inline: inline,
					},
					{
						name: "Output:",
						value: Formatters.codeBlock("javascript", limit(err)),
						inline: inline,
					},
					{
						name: "Type:",
						value: Formatters.codeBlock("javascript", "Error"),
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

			db.eval_private.replace({
				input: code,
				output: err,
				type: "Error",
				modal: "Error",
			});
		}

		let buttons = {
			type: 1,
			components: [
				{
					type: 2,
					label: "Save as File",
					style: 1,
					custom_id: "saveasfile-admin",
				},
				{
					type: 2,
					label: "Copy Code",
					style: 3,
					custom_id: "copy-admin",
				},
				{
					type: 2,
					label: "Reevaluate",
					style: 4,
					custom_id: "reevaluate",
				},
			],
		};

		if (hidden.toLowerCase() === "y") {
			await interaction.deferReply({
				ephemeral: true,
			});
			await interaction.followUp({
				embeds: [embed],
				components: [buttons],
				ephemeral: true,
			});
		} else {
			await interaction.reply({
				embeds: [embed],
				components: [buttons],
			});
		}
	},
};
