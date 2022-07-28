// Packages
const mongoose = require('mongoose');
const logger = require("../logger.js");
require('dotenv').config();

// Schemas
const evalPublicSchema = require('./schemas/eval_public.js');
const evalPrivateSchema = require('./schemas/eval_private.js');
const allowedChannelsSchema = require('./schemas/allowedChannels.js');
const usersSchema = require('./schemas/users.js');

// MongoDB Connection Options
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

// Initalize MongoDB
this.mongo = mongoose.connect(process.env.MONGO, options, (err) => {
    if (err) {
        logger.error("400", `MongoDB Connection Error`, err);
    } else {
        logger.info("200", "MongoDB Connected", {});
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

const allowed_channels = {
    async get() {
        const data = await allowedChannelsSchema.find({});
        return data[0];
    },

    async add(id) {
        const data = await allowedChannelsSchema.find({});
        let oldChannels = data[0].allowedChannels;
        let newChannels = [];

        oldChannels.forEach(channel => {
            newChannels.push(channel);
        });

        newChannels.push(id);

        let returned;

        setTimeout(() => {
            allowedChannelsSchema.replaceOne(data, {allowedChannels: newChannels}, null, (err, doc) => {
                if (err) {
                    logger.error("400", `MongoDB Document Replace Error`, err);
                } else {
                    returned = doc;
                }
            });
        }, 3000);

        return returned;
    },
};

const users = {
    async get(id) {
        const data = await usersSchema.findOne({
            user_id: id
        });

        return data;
    },

    async createUser(user_id, ratelimit) {
        const doc = new usersSchema({
            user_id: user_id,
            badges: [],
            ratelimit: ratelimit,
            bio: null
        });

        doc.save().then(() => {
            logger.info("200", "MongoDB Document Created", {});
        }).catch(err => {
            logger.error("400", `MongoDB Document Create Error`, err);
        });
    },

    async addBadge(user_id, badgeData) {
        const data = await usersSchema.findOne({
            user_id: user_id 
        });

        let badges = data.badges;
        badges.push(badgeData);

        usersSchema.replaceOne({user_id: data.user_id}, data, null, (err, doc) => {
            if (err) {
                logger.error("400", `MongoDB Document Replace Error`, err);
            } else {
                returned = doc;
            }
        });
    },
};

module.exports = {
    eval_public,
    eval_private,
    allowed_channels,
    users
};
