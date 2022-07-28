const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("eval")
		.setDescription("Run code inside of a container!"),
	async execute(client, interaction, MessageEmbed, Formatters, db) {
		/*let modal;
        const admins = client.admins;
        
        if (admins.includes(interaction.user.id)) {
            modal = new Modal()
                .setCustomId('eval-private')
                .setTitle('Evaluate your Code (Admin)')
                .addComponents([
                    new TextInputComponent()
                    .setCustomId('code')
                    .setLabel('Code')
                    .setStyle('LONG')
                    .setMinLength(1)
                    .setPlaceholder('Write your Code here!')
                    .setRequired(true),
                    new TextInputComponent()
                    .setCustomId('inline')
                    .setLabel('Do you want the embed to be inlined?')
                    .setStyle('SHORT')
                    .setMaxLength(1)
                    .setPlaceholder('Y/N [Default: N]')
                    .setRequired(false),
                    new TextInputComponent()
                    .setCustomId('hidden')
                    .setLabel('Hidden?')
                    .setStyle('SHORT')
                    .setMaxLength(1)
                    .setPlaceholder('Y/N [Default: N]')
                    .setRequired(false),
                ]);
        } else {
            modal = new Modal()
                .setCustomId('eval-public')
                .setTitle('Evaluate your Code (Public)')
                .addComponents([
                    new TextInputComponent()
                    .setCustomId('language')
                    .setLabel('Language:')
                    .setStyle('SHORT')
                    .setPlaceholder('What language is the code in? [Default: javascript]')
                    .setRequired(false),
                    new TextInputComponent()
                    .setCustomId('code')
                    .setLabel('Code')
                    .setStyle('LONG')
                    .setMinLength(5)
                    .setPlaceholder('Write your Code here!')
                    .setRequired(true),
                    new TextInputComponent()
                    .setCustomId('inline')
                    .setLabel('Do you want the embed to be inlined?')
                    .setStyle('SHORT')
                    .setMaxLength(1)
                    .setPlaceholder('Y/N [Default: N]')
                    .setRequired(false),
                    new TextInputComponent()
                    .setCustomId('hidden')
                    .setLabel('Do you want the results to be private?')
                    .setStyle('SHORT')
                    .setMaxLength(1)
                    .setPlaceholder('Y/N [Default: N]')
                    .setRequired(false),
                ]);
        }

        showModal(modal, {
            client: client,
            interaction: interaction
        });
    */
		message.reply("This command has been temporaily disabled!");
	},
};
