const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
	language: String,
	input: String,
	output: String,
	version: String,
});

module.exports = mongoose.model("EvalPublic", schema);
