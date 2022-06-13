const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const urban = require("urban-dictionary");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('urban')
        .setDescription('Search for Urban Dictionary definitions.')
        .addStringOption((option =>
            option
            .setName('query')
            .setDescription("What do you want to search for?")
            .setRequired(true)
        )),
    async execute(client, interaction, MessageEmbed, Formatters, db) {
        const query = interaction.options.getString('query');

        urban.define(query, async (error, results) => {
            if (error) {
                let embed = new MessageEmbed()
                    .setTitle("brain damage")
                    .setColor("RANDOM")
                    .addField("Message", Formatters.codeBlock("javascript", error), false);

                await interaction.reply({
                    embeds: [embed]
                });
            } else {
                let embed = new MessageEmbed()
                    .setTitle(results[0].word)
                    .setURL(results[0].permalink)
                    .setColor("RANDOM")
                    .addField("Definition", results[0].definition, false)
                    .addField("Ratings", `**${results[0].thumbs_up}** thumbs up, **${results[0].thumbs_down}** thumbs down`, false);

                await interaction.reply({
                    embeds: [embed]
                });
            }
        });
    },
};