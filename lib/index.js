// Import the required modules from the package
const { Processor } = require('./processor');
const { Render } = require('./render');

// Converts a file template for evaluation
class Template extends String {

  // Create a new template from the html content
  constructor(content) {

    // Process the html content and extract the processed code and variables
    const { code, variables } = new Processor(content);

    // Pass the processed html code to the super function to create a string
    super(code);

    // Bind the variables extracted from the processed code
    this.variables = variables;
  }

  // Create a new template from a content string
  static fromString(content) {

    // Return a new template from the content string
    return new Template(content);
  }

  // Render a template to html from a content string and data
  static renderFromString(content, data) {

    // Return a rendered html
    return new Template(content).render(data);
  }

  // Define the species of the template class to be a String
  static get [Symbol.species]() {
    return String; 
  }

  // Pass the data to the render function and return the html
  render() {

    // Return the rendered html template
    return Render(this, this.variables, data);
  }
}

// Export the module
module.exports = { Template };