const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    user_id: String,
    badges: Array,
    ratelimit: Number,
});

module.exports = mongoose.model('user', schema);