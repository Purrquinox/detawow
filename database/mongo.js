// Packages
const mongoose = require("mongoose");
const logger = require("../logger.js");
require("dotenv").config();

// Schemas
const evalPublicSchema = require("./schemas/eval_public.js");
const evalPrivateSchema = require("./schemas/eval_private.js");
const aiChannelsSchema = require("./schemas/aiChannels.js");
const usersSchema = require("./schemas/users.js");

// MongoDB Connection Options
const options = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
};

// Initalize MongoDB
this.mongo = mongoose.connect(process.env.MONGO, options, (err) => {
	if (err) {
		logger.error("MongoDB", `Connection Error`, err);
	} else {
		logger.info("MongoDB", "Connected", {});
	}
});

const eval_public = {
	async get() {
		const data = await evalPublicSchema.find({});
		return data[0];
	},

	async replace(obj) {
		const data = await evalPublicSchema.find({});
		let returned;

		evalPublicSchema.replaceOne(data[0], obj, null, (err, doc) => {
			if (err) {
				logger.error("400", `MongoDB Document Replace Error`, err);
			} else {
				returned = doc;
			}
		});

		return returned;
	},
};

const eval_private = {
	async get() {
		const data = await evalPrivateSchema.find({});
		return data[0];
	},

	async replace(obj) {
		const data = await evalPrivateSchema.find({});
		let returned;

		evalPrivateSchema.replaceOne(data[0], obj, null, (err, doc) => {
			if (err) {
				logger.error("400", `MongoDB Document Replace Error`, err);
			} else {
				returned = doc;
			}
		});

		return returned;
	},
};

const aiChannels = {
	async get(channel_id) {
		const data = await aiChannelsSchema.findOne({
			channel_id: channel_id
		});

		return data;
	},

	async add(channel_id, guild_id, category) {
		const doc = new aiChannelsSchema({
			channel_id: channel_id,
			guild_id: guild_id,
			category: category
		});

		doc.save()
			.then(() => {
				logger.info("200", "MongoDB Document Created", {});
			})
			.catch((err) => {
				logger.error("400", `MongoDB Document Create Error`, err);
			});
	},
};

const users = {
	async get(id) {
		const data = await usersSchema.findOne({
			user_id: id,
		});

		return data;
	},

	async createUser(user_id, ratelimit) {
		const doc = new usersSchema({
			user_id: user_id,
			badges: [],
			ratelimit: ratelimit,
			bio: null,
		});

		doc.save()
			.then(() => {
				logger.info("200", "MongoDB Document Created", {});
			})
			.catch((err) => {
				logger.error("400", `MongoDB Document Create Error`, err);
			});
	},

	async addBadge(user_id, badgeData) {
		const data = await usersSchema.findOne({
			user_id: user_id,
		});

		let badges = data.badges;
		badges.push(badgeData);

		usersSchema.replaceOne(
			{ user_id: data.user_id },
			data,
			null,
			(err, doc) => {
				if (err) {
					logger.error("400", `MongoDB Document Replace Error`, err);
				} else {
					returned = doc;
				}
			}
		);
	},
};

module.exports = {
	eval_public,
	eval_private,
	aiChannels,
	users,
};
