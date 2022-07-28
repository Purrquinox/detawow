// Packages
const {
	Client,
	Formatters,
	GatewayIntentBits,
	InteractionType,
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
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
});

// Add "db" to client
client.database = db;

// Initalize Client Extensions
clientExtension(client);

// Custom Message Embed Function
class MessageEmbed {
	setTitle = (title) => {
		this.title = title;
	};

	setDescription = (description) => {
		this.description = description;
	};

	setColor = (color) => {
		if (color === "RANDOM")
			this.color = Math.floor(Math.random() * 16777215).toString(16);
		else this.color = color;
	};

	setFooter = (data) => {
		this.footer = {
			name: data.name,
			icon_url: data.icon_url,
		};
	};

	setThumbnail = (thumbnail) => {
		this.thumbnail = {
			url: thumbnail,
		};
	};

	addField = (name, value, inline) => {
		this.fields.push({
			name: name,
			value: value,
			inline: inline,
		});
	};

	addFields = (fields) => {
		this.fields = fields;
	};

	setURL = (url) => {
		this.url = url;
	};

	toJSON = () => {
		const title = this.title;
		const description = this.description;
		const color = this.color;
		const footer = this.footer;
		const thumbnail = this.thumbnail;
		const fields = this.fields;

		if (!title) throw new Error("[MessageEmbed] Embed Title is required");
		if (!color) throw new Error("[MessageEmbed] Embed Color is required");

		return {
			color: color,
			title: title,
			url: url || null,
			description: description || null,
			thumbnail: thumbnail || null,
			footer: footer || null,
			fields: fields || null,
			timestamp: new Date(),
		};
	};
}

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
				components: [
					{
						type: 1,
						components: [
							{
								type: 2,
								label: "Open Modal",
								style: 1,
								custom_id: "eval",
							},
						],
					},
				],
			});
			break;

		case "bash":
			message.reply({
				content: "Click the button below to open the modal.",
				components: [
					{
						type: 1,
						components: [
							{
								type: 2,
								label: "Open Modal",
								style: 1,
								custom_id: "bash",
							},
						],
					},
				],
			});
			break;

		case "uptime":
			const formatTime = (seconds) => {
				const days = Math.floor(seconds / 86400);
				seconds -= days * 86400;

				const hours = Math.floor(seconds / (60 * 60));
				seconds -= hours * 3600;

				const minutes = Math.floor((seconds % (60 * 60)) / 60);
				seconds -= minutes * 60;

				const secs = Math.floor(seconds % 60);

				return `${days} days, ${hours} hours, ${minutes} minutes, ${secs} seconds`;
			};

			message.reply({
				content: formatTime(process.uptime()),
			});
			break;

		case "bruh":
			message.reply({
				content: client.user.displayAvatarURL(),
				components: [
					{
						type: 1,
						components: [
							{
								type: 2,
								label: "BRUH",
								style: 4,
								custom_id: "unknown",
								disabled: true,
							},
						],
					},
				],
			});
			break;

		case "help":
			message.reply({
				content: "ew imagine not knowing how to use this bot",
				components: [
					{
						type: 1,
						components: [
							{
								type: 2,
								label: "brain damage",
								style: 4,
								custom_id: "unknown",
								disabled: true,
							},
						],
					},
				],
			});
			break;

		case "rate":
			message.reply({
				content: "shitty as always",
			});
			break;

		default:
			message.reply({
				content: "I don't know that command.",
				components: [
					{
						type: 1,
						components: [
							{
								type: 2,
								label: "brain damage",
								style: 4,
								custom_id: "unknown",
								disabled: true,
							},
						],
					},
				],
			});
			break;
	}
});

// AI Chat Event
client.ratelimit = new Map();

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
					MessageEmbed,
					Formatters,
					db
				);
			} catch (error) {
				console.error(error);

				let embed = new MessageEmbed()
					.setTitle("brain damage")
					.setColor("RANDOM")
					.addField(
						"Message",
						Formatters.codeBlock("javascript", error),
						false
					);

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
					MessageEmbed,
					Formatters,
					db
				);
			} catch (error) {
				console.error(error);

				let embed = new MessageEmbed()
					.setTitle("brain damage")
					.setColor("RANDOM")
					.addField(
						"Message",
						Formatters.codeBlock("javascript", error),
						false
					);

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
						MessageEmbed,
						Formatters,
						db
					);
				} catch (error) {
					console.error(error);

					let embed = new MessageEmbed()
						.setTitle("brain damage")
						.setColor("RANDOM")
						.addField(
							"Message",
							Formatters.codeBlock("javascript", error),
							false
						);

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
			let embed = new MessageEmbed()
				.setTitle("Error")
				.setColor("#FF0000")
				.setDescription("Command does not exist!");

			await interaction.reply({
				embeds: [embed],
			});
		}

		try {
			await modal.execute(
				client,
				interaction,
				MessageEmbed,
				Formatters,
				db
			);
		} catch (error) {
			let embed = new MessageEmbed()
				.setTitle("brain damage")
				.setColor("RANDOM")
				.addField(
					"Message",
					Formatters.codeBlock("javascript", error),
					false
				);

			await interaction.reply({
				embeds: [embed],
			});
		}
	}
});

// Login to Discord
client.login(process.env.TOKEN);