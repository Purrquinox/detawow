const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
	channel_id: String,
	guild_id: String,
	category: String,
});

module.exports = mongoose.model("aiChannels", schema);
