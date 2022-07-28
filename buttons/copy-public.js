module.exports = {
	data: {
		name: "copy-public",
	},
	async execute(client, interaction, MessageEmbed, Formatters, db) {
		const data = await db.eval_public.get();
		const code = data.input;

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

		await interaction.reply({
			content: Formatters.codeBlock("javascript", limit(code)),
			ephemeral: true,
		});
	},
};
