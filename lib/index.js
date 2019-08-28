// Import the virtual html model
const { HTMLModel } = require('./html');

// Converts a file template for evaluation
class Template extends String {

  constructor(source) {

    // Add scoping to the template values
    // let html = source.replace(/(?:\$\{)(.*?)(?:\})/igms, (a, m) => `\$\{data.${m}\}`);

    // Fetch the tree from the html
    const model = new HTMLModel(source);

    for (const [i, block] of Object.entries(model.blocks)) {

      // Find the $if statements in the block
      const ifattr = /^(?:\<*?[^\<\>]*?)((?:\ \$if\=\")(.*?)(?:\"))/gms.exec(block);

      // Check and modify if statements
      if (ifattr) {

        // Extract the attr and statement
        const [, attr, statement] = ifattr;

        // Remove the attribute
        // block = block.replace(attr, '');

        model.updateBlock(i, `\${ (${statement}) ? \`${block.replace(attr, '')}\` : ''}`);

      }
    }

    // Pass the parsed template to the super
    super(model.code);
  }

  // Read a template from a string (same as class constructor)
  static fromString(string) {

    // Return a new template
    return new Template(string);
  }

  // Define the species of the template class as String
  static get [Symbol.species]() {
    return String; 
  }

  // Evaluate the template from set of data
  render(data = {}) {

    // Return the evaluated template html
    return new Function(`data`, `return \`${this}\``).call(null, data);
  }
}

// Define the template loader to be used by webpack browserify etc
const Loader = (string) => {

  // Create a template from the file
  const html = Template.fromString(string);

  // Return the template export
  return `module.exports = (data = {}) => new Function(\`data\`, \`return \\\`${html}\\\`\`).call(null, data);`;
}

// Export using standard exports (can't be bothered transpiling)
module.exports = { Template, Loader };