const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription("Reload commands"),
    async execute(client, interaction, MessageEmbed, Formatters, db) {
        client.commands.clear();
        const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
    
        for (const file of commandFiles) {
            const command = require(`./${file}`);
            client.commands.set(command.data.name, command);
        }

        await interaction.reply({
            content: "Commands have been reloaded." 
        });
    }
}