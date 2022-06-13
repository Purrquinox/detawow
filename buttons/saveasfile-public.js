module.exports = {
    data: {
        "name": "saveasfile-public",
    },
    async execute(client, interaction, MessageEmbed, Formatters, db) {
        const data = await db.eval_public.get();
        const code = data.input;
        const results = data.output;
        const language = data.language;
        const version = data.version;

        const json = {
            input: code,
            output: results,
            language: language,
            version: version,
        };

        const file = Buffer.from(JSON.stringify(json), 'utf8');

        await interaction.reply({
            files: [{
                attachment: file,
                name: "evaluation.json"
            }],
            ephemeral: true,
        });
    },
};