// Packages
const {
	Client,
	Formatters,
	GatewayIntentBits,
	InteractionType,
	EmbedBuilder,
} = require("discord.js");
const fs = require("node:fs");
const util = require("util");
const markov = require("markov");
const chain = markov(1);
const clientExtension = require("./client_extension.js");
const db = require("./database/mongo.js");
const logger = require("./logger.js");
require("dotenv").config();

// Initalize Discord Client
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

// Add "db" to client
client.database = db;

// Initalize Client Extensions
clientExtension(client);

// Ready Event
client.on("ready", () => {
	logger.info("Discord", `Logged in as ${client.user.tag}!`);

	// Set Activity
	client.user.setActivity(`brain damage`, {
		type: "WATCHING",
	});
});

// Debug Event
client.on("debug", (info) => {
	logger.debug("Discord", info);
});

// Error Event
client.on("error", (error) => {
	logger.error("Discord", error);
});

// AI Chat Event
client.ratelimit = new Map();

client.on("messageCreate", async (message) => {
	// Block Message
	if (message.author.bot) return;
	if (message.channel.type === "dm") return;
	if (process.env.NODE_ENV === "canary") return;

	// Block message if channel is not in the database
	let data = await db.aiChannels.get(message.channel.id)
	if (!data) return;

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
	const file = fs.createReadStream(__dirname + `/${data.category}.txt`);

	// Ask chain for response to user message and send
	chain.seed(file, async () => {
		message.channel.sendTyping();

		setTimeout(() => {
			const response = chain.respond(message.content);
			message.reply(response.join(" "));
		}, 2000);
	});

	// Add user to ratelimit
	setTimeout(() => {
		client.ratelimit.delete(message.author.id);
	}, client.ratelimit.get(message.author.id));
});

// Add Commands
client.commands = new Map();
const commandFiles = fs
	.readdirSync("./commands")
	.filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// Add Modals
client.modals = new Map();
const modalFiles = fs
	.readdirSync("./modals")
	.filter((file) => file.endsWith(".js"));

for (const file of modalFiles) {
	const modal = require(`./modals/${file}`);
	client.modals.set(modal.data.name, modal);
}

// Add Buttons
client.buttons = new Map();
const buttonFiles = fs
	.readdirSync("./buttons")
	.filter((file) => file.endsWith(".js"));

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
	if (interaction.isChatInputCommand()) {
		const command = client.commands.get(interaction.commandName);

		if (command) {
			try {
				await command.execute(
					client,
					interaction,
					EmbedBuilder,
					Formatters,
					db
				);
			} catch (error) {
				console.error(error);

				let embed = new EmbedBuilder()
					.setTitle("brain damage")
					.setColor(0xff0000)
					.addFields({
						name: "Message",
						value: Formatters.codeBlock("javascript", error),
						inline: false,
					});

				await interaction.reply({
					embeds: [embed],
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
				await button.execute(
					client,
					interaction,
					EmbedBuilder,
					Formatters,
					db
				);
			} catch (error) {
				console.error(error);

				let embed = new EmbedBuilder()
					.setTitle("brain damage")
					.setColor(0xff0000)
					.addFields({
						name: "Message",
						value: Formatters.codeBlock("javascript", error),
						inline: false,
					});

				await interaction.reply({
					embeds: [embed],
				});
			}
		} else {
			// Check if button is equal to a slash command
			if (command) {
				try {
					await command.execute(
						client,
						interaction,
						EmbedBuilder,
						Formatters,
						db
					);
				} catch (error) {
					console.error(error);

					let embed = new EmbedBuilder()
						.setTitle("brain damage")
						.setColor(0xff0000)
						.addFields({
							name: "Message",
							value: Formatters.codeBlock("javascript", error),
							inline: false,
						});

					await interaction.reply({
						embeds: [embed],
					});
				}
			} else {
				// button does not equal to anything
				await interaction.reply(
					"This button does not have any functionality."
				);
			}
		}
	}

	// Modal
	if (interaction.type === InteractionType.ModalSubmit) {
		// Block banned users
		const bannedUsers = client.bannedUsers;
		if (bannedUsers.includes(interaction.user.id)) return;

		const modal = client.modals.get(interaction.customId);

		if (!modal) {
			let embed = new EmbedBuilder()
				.setTitle("Error")
				.setColor(0xff0000)
				.setDescription("Command does not exist!");

			await interaction.reply({
				embeds: [embed],
			});
		}

		try {
			await modal.execute(
				client,
				interaction,
				EmbedBuilder,
				Formatters,
				db
			);
		} catch (error) {
			let embed = new EmbedBuilder()
				.setTitle("brain damage")
				.setColor(0xff0000)
				.addFields({
					name: "Message",
					value: Formatters.codeBlock("javascript", error),
					inline: false,
				});

			await interaction.reply({
				embeds: [embed],
			});
		}
	}
});

// Login to Discord
client.login(process.env.TOKEN);
