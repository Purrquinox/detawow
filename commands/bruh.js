const {
    SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bruh')
        .setDescription('i hate my life...'),
    async execute(client, interaction, MessageEmbed, Formatters, db) {
        await interaction.reply({
            content: client.user.displayAvatarURL(),
            components: [{
                "type": 1,
                "components": [{
                    "type": 2,
                    "label": "BRUH",
                    "style": 4,
                    "custom_id": "unknown",
                    "disabled": true
                }]
            }]
        });
    },
};