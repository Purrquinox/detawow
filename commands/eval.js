const {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("eval")
		.setDescription("Run code inside of a container!"),
	async execute(client, interaction, EmbedBuilder, Formatters, db) {
		let modal;
		const admins = client.admins;

		if (admins.includes(interaction.user.id)) {
			modal = new ModalBuilder()
				.setCustomId("eval-private")
				.setTitle("Evaluate your Code (Admin)");

			const code = new TextInputBuilder()
				.setCustomId("code")
				.setLabel("Code")
				.setPlaceholder("Write your Code here!")
				.setStyle(TextInputStyle.Paragraph)
				.setMinLength(1)
				.setRequired(true);

			const inline = new TextInputBuilder()
				.setCustomId("inline")
				.setLabel("Do you want the embed to be inlined?")
				.setPlaceholder("Y/N [Default: N]")
				.setStyle(TextInputStyle.Short)
				.setMaxLength(1)
				.setRequired(false);

			const hidden = new TextInputBuilder()
				.setCustomId("hidden")
				.setLabel("Do you want the embed to be hidden?")
				.setPlaceholder("Y/N [Default: N]")
				.setStyle(TextInputStyle.Short)
				.setMaxLength(1)
				.setRequired(false);

			modal.addComponents(
				new ActionRowBuilder().addComponents(code),
				new ActionRowBuilder().addComponents(inline),
				new ActionRowBuilder().addComponents(hidden)
			);
		} else {
			modal = new ModalBuilder()
				.setCustomId("eval-public")
				.setTitle("Evaluate your Code (Public)");

			const language = new TextInputBuilder()
				.setCustomId("language")
				.setLabel("Language:")
				.setPlaceholder(
					"What language is the code in? [Default: javascript]"
				)
				.setStyle(TextInputStyle.Short)
				.setRequired(false);

			const code = new TextInputBuilder()
				.setCustomId("code")
				.setLabel("Code")
				.setPlaceholder("Write your Code here!")
				.setStyle(TextInputStyle.Paragraph)
				.setMinLength(5)
				.setRequired(true);

			const inline = new TextInputBuilder()
				.setCustomId("inline")
				.setLabel("Do you want the embed to be inlined?")
				.setPlaceholder("Y/N [Default: N]")
				.setStyle(TextInputStyle.Short)
				.setMaxLength(1)
				.setRequired(false);

			const hidden = new TextInputBuilder()
				.setCustomId("hidden")
				.setLabel("Do you want the embed to be hidden?")
				.setPlaceholder("Y/N [Default: N]")
				.setStyle(TextInputStyle.Short)
				.setMaxLength(1)
				.setRequired(false);

			modal.addComponents(
				new ActionRowBuilder().addComponents(language),
				new ActionRowBuilder().addComponents(code),
				new ActionRowBuilder().addComponents(inline),
				new ActionRowBuilder().addComponents(hidden)
			);
		}

		await interaction.showModal(modal);
	},
};
