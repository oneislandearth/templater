class HTMLNode {
  
  constructor(options = {}) {

    // Bind the value and the parent
    this.name = ((options.name) ? options.name : null);
    this.parent = ((options.parent) ? options.parent : null);

    // Bind the start and finish index
    this.start = ((options.start) ? options.start : 0);
    this.finish = ((options.finish) ? options.finish : 0);

    // Define the current selected node
    this.selected = this;

    // Create an empty array for children
    this.children = [];

  }

  open({ name, start }) {

    // Define the parent for the current node
    const parent = this.selected;

    // Create a new html node from the tag
    const node = new HTMLNode({ name, parent, start });

    // Add the new html node to the selected node, then return its index within the selected node's children
    const index = (this.selected.children.push(node) -1);

    // Change the selected node to the new node
    this.selected = this.selected.children[index];
  }

  close({ finish }) {

    // Update the finishing value for the selected html node
    this.selected.finish = finish;

    // Change the selected html node to be the parent of the selected html node
    this.selected = this.selected.parent;
  }

  get nodes() {

    // Add the current node (if valid) otherwise create an empty list
    const nodes = (this.name) ? [this] : [];

    // Fetch all of the child nodes
    for (const child of this.children) nodes.push(...child.nodes);

    // Return the list of nodes
    return nodes;
  }

  toString(depth = 0) {

    // Add the root node to the start of the string if it exists
    let string = (!this.name) ? '' : `${'  '.repeat(depth)}${this.name}\n`;

    // Check if the html node has any children
    if (this.children.length > 0) {
      
      // Iterate through each of the children
      for (const child of this.children) {

        // Calculate the recursive depth (based on the tag)

        string += child.toString((!this.name) ? depth : depth + 1);
      }
    }


    // Return the structure as a string
    return string;
  }
}

class HTMLModel {

  constructor(code) {

    // Bind the code to the html model
    this.code = code;

    // Parse the model
    this.parse();
  }

  parse() {

    // Create the root node of the html model
    this.model = new HTMLNode();

    // Define the regex for extracting each html tag 
    const regex = /(?:\<)(?<tag>[^\ \>]{1,})(?:\ {0,}[^\>\<]*?)(\/*)(?:\>)/igms;

    // Extract all of the matches from the code
    const matches = this.code.matchAll(regex);

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
        this.model.open({ name, start });

        // Close the current tag as it is self-closing
        this.model.close({ finish });
    
      // Check if the current tag is a closing tag
      } else if (name.indexOf('/') == 0) {
    
        // Close the current tag by stepping up a level
        this.model.close({ finish });
    
      } else {
    
        // Add the node and step down a level
        this.model.open({ name, start });
      }
    }
  }

  get nodes() {
    return this.model.nodes;
  }

  get blocks() {
    return this.nodes.map(node => this.code.substring(node.start, node.finish));
  }

  updateBlock(index, code) {

    // Define the current node
    const node = this.nodes[index];

    // Update the code
    this.code = (this.code.substring(0, node.start) + code + this.code.substring(node.finish, this.code.length));

    // Reparse the code after updating it
    this.parse();
  }

  toString() {
    return this.model.toString();
  }
}

// Export the modules
module.exports = { HTMLModel };