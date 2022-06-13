const {
	SlashCommandBuilder
} = require('@discordjs/builders');
const Eval = require("open-eval");
const ev = new Eval();

module.exports = {
	data: {
		"name": "eval-public"
	},
	async execute(client, interaction, MessageEmbed, Formatters, db) {
		let language = interaction.getTextInputValue('language') || "javascript";
		const code = interaction.getTextInputValue('code');
		let inline = interaction.getTextInputValue('inline') || "n";
		let hidden = interaction.getTextInputValue('hidden') || "n"
		let embed;

		if (language.toLowerCase() === "nodejs") {
			language = "javascript";
		}

		if (inline.toLowerCase() === "y") {
			inline = true;
		} else {
			inline = false;
		}

		const bannedLangs = [];

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

		if (bannedLangs.includes(language)) {
			embed = new MessageEmbed()
				.setTitle("Evaluation Results")
				.setColor("RANDOM")
				.setDescription("This language was banned by the creator of this bot!");
		} else {
			let results = await ev.eval(language, code).then(async (results) => {
				embed = new MessageEmbed()
					.setTitle("Evaluation Results")
					.setColor("RANDOM")
					.addField("Language:", results.language || "No language detected!", inline)
					.addField("Input:", Formatters.codeBlock(results.language || language, limit(code)), inline)
					.addField("Output:", Formatters.codeBlock(language, limit(results.output || results.message)), inline)
					.addField("Version:", results.version || "No version detected!", inline)
					.setFooter({
						iconURL: interaction.user.displayAvatarURL(),
                    	text: `Executed by ${interaction.user.username}, in about ${Math.floor(Date.now() - interaction.createdAt)} milliseconds`
               	 	});

				db.eval_public.replace({
					language: results.language || "No language detected!",
					input: code,
					output: results.output || results.message,
					version: results.version || "No version detected!",
				});
			}).catch(async (error) => {
				embed = new MessageEmbed()
					.setTitle("Evaluation Results")
					.setColor("#FF0000")
					.addField("Input:", Formatters.codeBlock(language, limit(code)), inline)
					.addField("Output:", Formatters.codeBlock(language, limit(error)), inline)
					.setFooter({
						iconURL: interaction.user.displayAvatarURL(),
						text: `Executed by ${interaction.user.username}, in about ${Math.floor(Date.now() - interaction.createdAt)} milliseconds`
					});

				db.eval_public.replace({
					language: results.language || "No language detected!",
					input: code,
					output: results.output || results.message,
					version: results.version || "No version detected!",
				});
			});
		}

		let buttons = {
			"type": 1,
			"components": [{
				"type": 2,
				"label": "Save as File",
				"style": 1,
				"custom_id": "saveasfile-public"
			}, {
				"type": 2,
				"label": "Copy Code",
				"style": 3,
				"custom_id": "copy-public"
			}]
		};

		if (hidden.toLowerCase() === "y") {
			await interaction.deferReply({
				ephemeral: true
			})
			await interaction.followUp({
				embeds: [embed],
				components: [buttons],
				ephemeral: true
			});
		} else {
			await interaction.reply({
				embeds: [embed],
				components: [buttons]
			});
		}
	},
};