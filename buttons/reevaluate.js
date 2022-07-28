module.exports = {
	data: {
		name: "reevaluate",
	},
	async execute(client, interaction, MessageEmbed, Formatters, db) {
		const data = await db.eval_private.get();
		const code = data.input;

		const admins = client.admins;

		if (!admins.includes(interaction.user.id)) return;

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

			embed = new MessageEmbed()
				.setTitle("Evaluation Results")
				.setColor("RANDOM")
				.addField(
					"Input:",
					Formatters.codeBlock("javascript", limit(code)),
					false
				)
				.addField(
					"Output:",
					Formatters.codeBlock("javascript", limit(results)),
					false
				)
				.addField(
					"Type:",
					Formatters.codeBlock("javascript", typeOf),
					false
				)
				.addField(
					"Prototype:",
					Formatters.codeBlock("javascript", tree(evaled)),
					false
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
			embed = new MessageEmbed()
				.setTitle("Evaluation Results")
				.setColor("#FF0000")
				.addField(
					"Input:",
					Formatters.codeBlock("javascript", code),
					false
				)
				.addField(
					"Output:",
					Formatters.codeBlock("javascript", limit(err)),
					false
				)
				.addField(
					"Type:",
					Formatters.codeBlock("javascript", "Error"),
					false
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

		await interaction.reply({
			embeds: [embed],
			components: [buttons],
		});
	},
};
