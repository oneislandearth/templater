// Import the Templater from the package
const { Loader } = require('./index');

// Return the loader
exports.default = (content) => Loader(content);