// Import the html model
const { HTMLModel } = require('./html');

// Define the processor which processes the html model
class Processor {

  // Create a new processor from code
  constructor(code) {

    // Bind the html model created from the code
    this.model = HTMLModel.fromCode(code);

    // console.log(code)

    // Create an empty array of variables
    this.variables = [];

    // Proccess all of the template statements (e.g. ${variable})
    this.processStatements();

    // Process all of the "$if" attibutes (e.g. $if="variable")
    this.processIfAttributes();

    // Process all of the "$for" attributes (e.g. $for="(i, v) in list")
    this.processForAttributes();

    // Bind the code from the model
    this.code = this.model.code;

    // Delete the model as it is no longer needed
    delete this.model;
  }

  // Process the statements in the html
  processStatements() {

    // Define the regex for finding statements in the html
    const regex = /(?:\$\{)(.*?)(?:\})/igms;

    // Extract all of the matches in the html
    const matches = this.model.code.matchAll(regex);

    // Iterate through each of the statements and extract the variables if th
    for (const [, statement] of matches) this.extractVariables(statement);
  }

  // Process the $if attributes in the html
  processIfAttributes() {

    // Iterate through all of the tags in the html model
    for (let [i, tag] of Object.entries(this.model.tags())) {

      // Find the $if attributes in the tag
      const matches = /^(?:\<*?[^\<\>]*?)((?:\ \$if\=\")(.*?)(?:\"))/gms.exec(tag);

      // Check for the $if attributes
      if (matches) {

        // Extract the attribute and statement
        const [, attribute, statement] = matches;

        // Extract the variables from the statement
        this.extractVariables(statement);

        // Remove the $if attribute from the tag
        tag = tag.replace(attribute, '');

        // Update the tag with the template string to evaluate
        this.model.updateTag(i, `\${ (${statement}) ? \`${tag}\` : '' }`);
      }
    }
  }

  // Process the $if attributes in the html
  processForAttributes() {

    // Iterate through all of the tags in the html model
    for (let [i, tag] of Object.entries(this.model.tags())) {

      // Find the $for attributes in the tag without key or index
      const matchesRegular = /^(?:\<*?[^\<\>]*?)((?:\ \$for\=\")([^\ \,]*?)(?:\ )(of|in)(?:\ )([^\ \,]*?)(?:\"))/gms.exec(tag);

      // Find the $for attributes in the tag with key or index
      const matchesKeyIndex = /^(?:\<*?[^\<\>]*?)((?:\ \$for\=\"\()([^\ \,]*?)(?:\,\ *?)([^\ \,]*?)(?:\)\ )(of|in)(?:\ )([^\ \,]*?)(?:\"))/gms.exec(tag);

      // Check for the $for attributes
      if (matchesRegular || matchesKeyIndex) {

        // Create variables to be further extracted from the matches
        let attribute, prop, value, type, set;

        // Check whether the matches were regular
        if (matchesRegular) {

          // Extract the attribute, value, type of loop and set of items to iterate through
          [, attribute, value, type, set] = matchesRegular;

          // Define the flag name for prop based on the the type
          prop = (prop == 'in') ? 'index' : 'key';

        // Check if the matches contained key value / index value pairs
        } else if (matchesKeyIndex) {

          // Extract the attribute, prop (key or index name), value, type of loop and set of items to iterate through
          [, attribute, prop, value, type, set] = matchesKeyIndex;
        }

        // Define the flag name for index based on the prop value
        const index = (prop == 'index') ? 'i' : 'index';

        // Define the flag name for key based on the prop value
        const key = (prop == 'key') ? 'k' : 'key';

        // Determine the iterator based on the type (in or of) and bind the keys passed
        const iterator = (type == 'in') ? `([${key}, ${value}], ${prop})` : `([${prop}, ${value}], ${index})`;

        // Remove the $for attribute from the tag
        tag = tag.replace(attribute, '')

        // Extract the set variable
        this.extractVariables(set);

        // Update the tag to add the template loop
        this.model.updateTag(i, `\${ (${set} && ${set}.length > 0) ? Object.entries(${set}).map(${iterator} => \`${tag}\`).join('') : '' }`);
      }
    }
  }

  // Extract the javascript variables from a statement
  extractVariables(statement) {

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

    // Define the regex for matching all variables referrenced in the statement
    const regex = /(?<![\.\'\"\`\w\-\_\$])([a-zA-Z\_\$][\w\-\_\$]*)/igms;

    // Extract all of the matches from the statement
    const matches = statement.matchAll(regex);

    // Iterate through each of the matches
    for (const [,variable] of matches) {

      // Check that the match contains a variable, the variable is not a keyword and is not already in the list
      if (variable.length > 0 && keywords.indexOf(variable) == -1 && this.variables.indexOf(variable) == -1) {
        
        // Add the variable to the list of variables
        this.variables.push(variable); 
      }
    }
  }
}

// Export the module
module.exports = { Processor };