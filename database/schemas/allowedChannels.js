const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
	allowedChannels: Array,
});

module.exports = mongoose.model("allowedChannels", schema);
