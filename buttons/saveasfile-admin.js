module.exports = {
    data: {
        "name": "saveasfile-admin",
    },
    async execute(client, interaction, MessageEmbed, Formatters, db) {
        const data = await db.eval_private.get();
        const code = data.input;
        const results = data.output;
        const type = data.type;
        const prototype = data.modal;
        
        const admins = client.admins;

        if (!admins.includes(interaction.user.id)) return;

        const json = {
            input: code,
            output: results,
            type: type,
            prototype: prototype
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