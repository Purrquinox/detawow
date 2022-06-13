const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    input: String,
    output: String,
    type: String,
    modal: String
});

module.exports = mongoose.model('EvalPrivate', schema);