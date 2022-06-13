// Packages
const {
    Client,
    Collection,
    Formatters,
    MessageEmbed,
    Intents
} = require("discord.js");
const fs = require("fs");
const util = require("util");
const markov = require("markov");
const chain = markov(1);
const discordModals = require('discord-modals');
const clientExtension = require("./client_extension.js");
const colors = require('colors');
const db = require("./database/mongo.js");
require("dotenv").config();

// Initalize Discord Client
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

// Initalize Discord Modals
discordModals(client);

// Add "db" to client
client.database = db;

// Initalize Client Extensions
clientExtension(client);

// Ready Event
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`.bold.underline.red);

    // Set Activity
    client.user.setActivity(`brain damage`, {
        type: "WATCHING"
    });
});

// Debug Event
client.on("debug", (info) => {
    console.log(colors.green(info));
});

// Error Event
client.on("error", (error) => {
    console.log(colors.red(error));
});

// Message Commands Event
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.channel.type === "dm") return;
    if (process.env.NODE_ENV === "canary") return;

    // Block banned users
    const bannedUsers = client.bannedUsers;
    if (bannedUsers.includes(message.author.id)) return;

    // Prefix
    const prefix = ")";
    if (!message.content.startsWith(prefix)) return;

    // Text Command Handler
    switch (message.content.replace(prefix, "").split(" ")[0].toLowerCase()) {
        case "eval":
            message.reply({
                content: "Click the button below to open the modal.",
                components: [{
                    "type": 1,
                    "components": [{
                        "type": 2,
                        "label": "Open Modal",
                        "style": 1,
                        "custom_id": "eval"
                    }]
                }]
            });
        break;

        case "bash":
            message.reply({
                content: "Click the button below to open the modal.",
                components: [{
                    "type": 1,
                    "components": [{
                        "type": 2,
                        "label": "Open Modal",
                        "style": 1,
                        "custom_id": "bash"
                    }]
                }]
            });
        break;

        case "bruh":
            message.reply({
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
        break;

        case "help":
            message.reply({
                content: "ew imagine not knowing how to use this bot",
                components: [{
                    "type": 1,
                    "components": [{
                        "type": 2,
                        "label": "brain damage",
                        "style": 4,
                        "custom_id": "unknown",
                        "disabled": true
                    }]
                }]
            });
        break;

        case "rate":
            message.reply({
                content: "shitty as always"
            });
        break;

        default:
            message.reply({
                content: "I don't know that command.",
                components: [{
                    "type": 1,
                    "components": [{
                        "type": 2,
                        "label": "brain damage",
                        "style": 4,
                        "custom_id": "unknown",
                        "disabled": true
                    }]
                }]
            });
        break;
    }
});

// AI Chat Event
client.ratelimit = new Collection();

client.on("messageCreate", async (message) => {
    // Block Message
    if (message.author.bot) return;
    if (message.channel.type === "dm") return;
    if (process.env.NODE_ENV === "canary") return;

    // Block message if channel is not in the database
    let data = await db.allowed_channels.get();
    if (!data.allowedChannels.includes(message.channel.id)) return;

    // Block message if user is under the ratelimit
    if (client.ratelimit.get(message.author.id)) return;

    // Banned Users
    const bannedUsers = client.bannedUsers;
    if (bannedUsers.includes(message.author.id)) return;

    // Ratelimit
    const userData = await db.users.get(message.author.id);
    
    if (userData) {
        if (userData.ratelimit === 0) {
            client.ratelimit.set(message.author.id, 0);
        }

        client.ratelimit.set(message.author.id, userData.ratelimit * 60 * 1000);
    } else {
        client.ratelimit.set(message.author.id, 2 * 60 * 1000);
    }

    // Chain File
    const file = fs.createReadStream(__dirname + `/chain.txt`);

    // Ask chain for response to user message and send
    chain.seed(file, async () => {
        const response = chain.respond(message.content);
        message.reply(response.join(" "));
    });

    // Add user to ratelimit
    setTimeout(() => {
        client.ratelimit.delete(message.author.id);
    }, client.ratelimit.get(message.author.id));
});

// Add Commands
client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// Add Modals
client.modals = new Collection();
const modalFiles = fs.readdirSync('./modals').filter(file => file.endsWith('.js'));

for (const file of modalFiles) {
    const modal = require(`./modals/${file}`);
    client.modals.set(modal.data.name, modal);
}

// Add Buttons
client.buttons = new Collection();
const buttonFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));

for (const file of buttonFiles) {
    const button = require(`./buttons/${file}`);
    client.buttons.set(button.data.name, button);
}

// Interaction Event(s)
client.on("interactionCreate", async (interaction) => {
    // Block banned users
    const bannedUsers = client.bannedUsers;
    if (bannedUsers.includes(interaction.user.id)) return;

    // Slash Command
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (command) {
            try {
                await command.execute(client, interaction, MessageEmbed, Formatters, db);
            } catch (error) {
                console.error(error);

                let embed = new MessageEmbed()
                    .setTitle("brain damage")
                    .setColor("RANDOM")
                    .addField("Message", Formatters.codeBlock("javascript", error), false);

                await interaction.reply({
                    embeds: [embed]
                });
            }
        } else {
            await interaction.reply("This command does not exist.");
        }
    }

    // Button
    if (interaction.isButton()) {
        const button = client.buttons.get(interaction.customId);
        const command = client.commands.get(interaction.customId);

        if (button) {
            try {
                await button.execute(client, interaction, MessageEmbed, Formatters, db);
            } catch (error) {
                console.error(error);

                let embed = new MessageEmbed()
                    .setTitle("brain damage")
                    .setColor("RANDOM")
                    .addField("Message", Formatters.codeBlock("javascript", error), false);

                await interaction.reply({
                    embeds: [embed]
                });
            }
        } else {
            // Check if button is equal to a slash command
            if (command) {
                try {
                    await command.execute(client, interaction, MessageEmbed, Formatters, db);
                } catch (error) {
                    console.error(error);

                    let embed = new MessageEmbed()
                        .setTitle("brain damage")
                        .setColor("RANDOM")
                        .addField("Message", Formatters.codeBlock("javascript", error), false);

                    await interaction.reply({
                        embeds: [embed]
                    });
                }
            } else {
                // button does not equal to anything
                await interaction.reply("This button does not have any functionality.");
            }
        }
    }
});

client.on('modalSubmit', async (interaction) => {
    // Block banned users
    const bannedUsers = client.bannedUsers;
    if (bannedUsers.includes(interaction.user.id)) return;

    const modal = client.modals.get(interaction.customId);

    if (!modal) {
        let embed = new MessageEmbed()
            .setTitle("Error")
            .setColor("#FF0000")
            .setDescription("Command does not exist!");

        await interaction.reply({
            embeds: [embed]
        });
    }

    try {
        await modal.execute(client, interaction, MessageEmbed, Formatters, db);
    } catch (error) {
        let embed = new MessageEmbed()
            .setTitle("brain damage")
            .setColor("RANDOM")
            .addField("Message", Formatters.codeBlock("javascript", error), false);

        await interaction.reply({
            embeds: [embed]
        });
    }
});

// Login to Discord
client.login(process.env.TOKEN);