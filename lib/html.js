// Define the html node for creating 
class HTMLModel {
  
  // Create a new html model from the options passed
  constructor(options = {}) {

    // Bind the parent
    this.parent = ((options.parent) ? options.parent : null);

    // Bind the start and finish index
    this.start = ((options.start) ? options.start : 0);
    this.finish = ((options.finish) ? options.finish : 0);

    // Define the current selected node
    this.selected = this;

    // Create an empty array for children
    this.children = [];

    // Process the nodes if the there is code (root node)
    if (options.code) this.processCode(options.code);
  }

  // Create a new html model from code
  static fromCode(code) {

    // Return the root html model with the code
    return new HTMLModel({ code }); 
  }

  // Process the code into nodes
  processCode(code) {

    // Add the code to the root
    this.code = code;

    // Clear the child nodes on the root
    this.children = [];

    // Reset the current selected node to this
    this.selected = this;

    // Define the regex for extracting each html tag 
    const regex = /(?:\<)([\w\-\/]+)(?:\ *.*?)(\/*)(?:\>)/igms;

    // Extract all of the matches from the code
    const matches = code.matchAll(regex);

    // Iterate through each of the matches to construct the model
    for (const tag of matches) {

      // Determine the name of the current tag
      const name = tag[1];
    
      // Determine whether the tag is self-closing
      const closes = Boolean(tag[2]);
    
      // Determine the code indexes of the tag
      const start = tag.index;
      const finish = tag.index + tag[0].length;
    
      // Check if the current tag is self-closing
      if (closes) {
    
        // Add tag as a self-closing tag
        this.open({ start });

        // Close the current tag as it is self-closing
        this.close({ finish });
    
      // Check if the current tag is a closing tag
      } else if (name.indexOf('/') == 0) {
    
        // Close the current tag by stepping up a level
        this.close({ finish });
    
      } else {
    
        // Add the node and step down a level
        this.open({ start });
      }
    }
  }

  // Open a new html tag / create a new node
  open({ start }) {

    // Define the parent for the current node
    const parent = this.selected;

    // Create a new html node from the tag
    const node = new HTMLModel({ parent, start });

    // Add the new html node to the selected node, then return its index within the selected node's children
    const index = (this.selected.children.push(node) - 1);

    // Change the selected node to the new node
    this.selected = this.selected.children[index];
  }

  // Close the currently open tag
  close({ finish }) {

    // Update the finishing value for the selected html node
    this.selected.finish = finish;

    // Change the selected html node to be the parent of the selected html node
    this.selected = this.selected.parent;
  }

  // Fetch the nodes within the html model
  nodes(index = -1) {

    // Add the current node (if valid) otherwise create an empty list
    const nodes = (!this.code) ? [this] : [];

    // Fetch all of the child nodes
    for (const child of this.children) nodes.push(...child.nodes());

    // Return the list of nodes or a specific index
    return (index > -1) ? nodes[index] : nodes;
  }

  // Fetch tags of code within the html model
  tags(index = -1) {

    // Fetch all of the tags
    const tags = this.nodes().map(node => this.code.substring(node.start, node.finish));

    // Return the list of tags or a specific index
    return (index > -1) ? tags[index] : tags;
  }

  // Update the code for a tag in the html model
  updateTag(index, code) {

    // Define the current node
    const node = this.nodes(index);

    // Update the code and recreate the nodes
    this.processCode(this.code.substring(0, node.start) + code + this.code.substring(node.finish, this.code.length));
  }
}

// Export the module
module.exports = { HTMLModel };