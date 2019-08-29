// Import the required modules from the package
const { Template } = require('./index');
const { Render } = require('./render');

// Define the template loader to be used by webpack browserify etc
exports.default = (content) => {

  // Create a template from the file content
  const template = Template.fromString(content);

  // Convert the variables in the template to an array string
  const variables = `[${template.variables.map(variable => `'${variable}'`).join(', ')}]`;

  // Escape the characters in the html template string
  const html = `\`${template.replace(/(\$|\`)/igms, (m, variable) => `\\${variable}`)}\``;

  // Create the string of the the function for rendering the html
  const string = `module.exports = (data = {}) => (${Render})(${html}, ${variables}, data)`;

  // Return the function string for rendering
  return string;
}