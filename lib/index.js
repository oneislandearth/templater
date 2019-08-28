// Import the virtual html model
const { HTMLModel } = require('./html');

// Converts a file template for evaluation
class Template extends String {

  constructor(source) {

    // Add scoping to the template values
    // let html = source.replace(/(?:\$\{)(.*?)(?:\})/igms, (a, m) => `\$\{data.${m}\}`);

    // Fetch the tree from the html
    const model = new Parser(source);

    // Pass the parsed template to the super
    super(model.code);

    //
    this.variables = model.variables;
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
    return render(this, this.variables, data);
  }
}


// Render the template from the data
const render = (html = '', variables = [], data = {}) => {

  // Extract the params from the data
  const params = [...new Set([...variables, ...Object.keys(data)])].join(', ');

  // Return the evaluated template html
  return new Function(`{ ${params} }`, `return \`${html}\``).call(null, data);
}

// Rendereer
class Parser extends HTMLModel {

  constructor(model) {
    super(model);

    this.vars = [];

    this.parseStatements();

    this.parseIfBlocks();

    this.parseForBlocks();
  }

  parseStatements() {

    const regex = /(?:\$\{)(.*?)(?:\})/igms;

    const matches = this.code.matchAll(regex);

    for (const [, statement] of matches) {

      if (statement.length > 0) this.extractVariables(statement);
    }
  }

  parseIfBlocks() {

    for (const [i, block] of Object.entries(this.blocks)) {

      // Find the $if statements in the block
      const ifattr = /^(?:\<*?[^\<\>]*?)((?:\ \$if\=\")(.*?)(?:\"))/gms.exec(block);

      // Check and modify if statements
      if (ifattr) {

        // Extract the attr and statement
        const [, attr, statement] = ifattr;

        this.extractVariables(statement);

        this.updateBlock(i, `\${ (${statement}) ? \`${block.replace(attr, '')}\` : ''}`);

      }
    }
  }

  parseForBlocks() {

    for (const [i, block] of Object.entries(this.blocks)) {

      // Find the $for statements in the block
      const forattr = /^(?:\<*?[^\<\>]*?)((?:\ \$for\=\"\()([^\ \,]*?)(?:\,\ *?)([^\ \,]*?)(?:\)\ )(of|in)(?:\ )([^\ \,]*?)(?:\"))/gms.exec(block);

      // Check and modify if statements
      if (forattr) {

        // Extract the attr and statement
        const [, attr, prop, value, type, set] = forattr;

        // Define the flag name for index based on the prop value
        const index = (prop == 'index') ? 'i' : 'index';

        // Define the flag name for key based on the prop value
        const key = (prop == 'key') ? 'k' : 'key';

        // Determine the iterator based on the type (in or of) and bind the keys passed
        const iterator = (type == 'in') ? `([${key}, ${value}], ${prop})` : `([${prop}, ${value}], ${index})`;

        // Update the code block to add the loop
        this.updateBlock(i, `\${ Object.entries(${set}).map(${iterator} => \`${block.replace(attr, '')}\`).join('') }`);

      }
    }
  }

  extractVariables(code) {

    // Define a list of keywords to ignore
    const keywords = [
      'abstract', 'arguments', 'await', 'boolean', 'break', 'byte', 'case', 'catch', 
      'char', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 
      'double', 'else', 'enum', 'eval', 'export', 'extends', 'false', 'final', 
      'finally', 'float', 'for', 'function', 'goto', 'if', 'implements', 'import', 
      'in', 'instanceof', 'int', 'interface', 'let', 'long', 'native', 'new', 
      'null', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 
      'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'true', 
      'try', 'typeof', 'var', 'void', 'volatile', 'while', 'with', 'yield'
    ];

    // Define the regex for matching all variables reference in the code
    const regex =/(?<![\.\'\"\`\w\-\_])([\w\-\_]*)/igms;

    // Extract all of the matches from the code
    const matches = code.matchAll(regex);

    // Iterate through each of the matches
    for (const [,variable] of matches) {

      // If the match contains a variable then add it to the list of variables
      if (variable.length > 0 && keywords.indexOf(variable) == -1) this.vars.push(variable); 
    }
  }

  get variables() {    
    // Return the variables (removing duplicates)
    return [...new Set(this.vars)]
  }
}

// Define the template loader to be used by webpack browserify etc
const Loader = (string) => {

  // Create a template from the file
  const template = Template.fromString(string);

  // Convert the variables in the template to an array string
  const variables = `[${template.variables.map(v => `'${v}'`).join(', ')}]`;

  // Escape the characters in the html template string
  const html = `\`${template.replace(/(\$|\`)/igms, (a, m) => `\\${m}`)}\``;

  // Export the function for rendering the html
  return `module.exports = (data = {}) => (${render.toString()})(${html}, ${variables}, data)`;
}

// Export using standard exports (can't be bothered transpiling)
module.exports = { Template, Loader };