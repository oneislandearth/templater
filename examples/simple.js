// Import the template package
import { Template } from '../lib';

// Create a new template from a string
const template = Template.fromString(`<h1 $if="message">\${message}</h1><p $if="!message">No message...</p>`);

// Render the template (Case A)
let html = template.render({ message: 'hello earth' });

// Log the output
console.log('\n\x1b[1mCase A:\x1b[0m\n\n', html, '\n');

// Rerender the template (Case B)
html = template.render();

// Log the output
console.log('\x1b[1mCase B:\x1b[0m\n\n', html, '\n');

