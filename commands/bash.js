const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("bash")
		.setDescription("Run bash commands inside of a container!"),
	async execute(client, interaction, MessageEmbed, Formatters, db) {
		/*let modal;
        const admins = client.admins;
        
        if (admins.includes(interaction.user.id)) {
            modal = new Modal()
                .setCustomId('shell-private')
                .setTitle('Shell (Admin)')
                .addComponents([
                    new TextInputComponent()
                    .setCustomId('command')
                    .setLabel('Command')
                    .setStyle('LONG')
                    .setMinLength(1)
                    .setPlaceholder('Command to execute...')
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
                .setCustomId('shell-public')
                .setTitle('Shell (Public)')
                .addComponents([
                    new TextInputComponent()
                    .setCustomId('command')
                    .setLabel('Command')
                    .setStyle('LONG')
                    .setMinLength(5)
                    .setPlaceholder('Command to execute...')
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
        });*/

		message.reply("This command has been temporaily disabled!");
	},
};
