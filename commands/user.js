const {
    SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Get information about a user.')
        .addUserOption((option =>
            option
            .setName('user')
            .setDescription("What user do you want to get information about?")
            .setRequired(true)
        )),
    async execute(client, interaction, MessageEmbed, Formatters, db) {
        // Get the user
        const user = interaction.options.getUser('user');
        const data = await client.getUser(user.id);

        // Check if the user exists
        if (!data) {
            interaction.reply({
                content: "I couldn't find that user."
            });

            return;
        }

        // Badges
        const badges = data.otherData.badges;
        let badgeString = "";

        if (badges.length > 0) {
            for (let i = 0; i < badges.length; i++) {
                badgeString += `${badges[i]}\n`;
            }
        }
        else {
            badgeString = "No badges";
        }

        // Trusted
        const trusted = data.otherData.trusted;
        let trustedString = "";
        
        if (trusted === true) {
            trustedString = "Trusted";
        } else {
            trustedString = "Not trusted";
        };

        // Create embed
        const embed = new MessageEmbed()
        .setTitle(`${data.discordData.username}#${data.discordData.discriminator}`)
        .setThumbnail(data.discordData.avatar_url)
        .setColor("RANDOM")
        .addField("Username", String(data.discordData.username), false)
        .addField("Discriminator", String(data.discordData.discriminator), false)
        .addField("User ID", String(data.discordData.id), false)
        .addField("Created At", String(`<t:${data.discordData.created_at}>`), false)
        .addField("DetaWow Badges", String(badgeString), false)
        .addField("DetaWow Ratelimit", String(`${data.otherData.ratelimit} seconds`), false)
        .addField("DetaWow Trusted", String(trustedString), false);

        // Send embed
        interaction.reply({
            embeds: [embed]
        });
    },
};