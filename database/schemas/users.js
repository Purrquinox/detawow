const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    user_id: String,
    badges: Array,
    ratelimit: Number,
    bio: String
});

module.exports = mongoose.model('user', schema);
