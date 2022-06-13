// Packages
const colors = require("colors");

// Functions
const info = (id, title, json) => {
    console.log(`[${id.red}] ${title.green} - ${JSON.stringify(json)}`);
}

const error = (id, title, json) => {
    console.log(`[${id.green}] ${title.red} - ${JSON.stringify(json)}`);
}

// Export
module.exports = {
    info,
    error
}