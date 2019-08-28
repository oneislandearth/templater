// Import the template
import * as template from './example.js.html';

// Evaluate the template
let html = template();

// Log the output
console.log('\n\x1b[1mCase A:\x1b[0m\n\n', html, '\n');

// Rerender the template (Case B)
html = template({ person: 'earth' });

// Log the output
console.log('\x1b[1mCase B:\x1b[0m\n\n', html, '\n');
