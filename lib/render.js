// Render the template from the data
const Render = (html = '', variables = [], data = {}) => {

  // Extract the params from the data
  const params = [...new Set([...variables, ...Object.keys(data)])].join(', ');

  // Render the html template
  let result = new Function(`{ ${params} }`, `return \`${html}\``).call(null, data);

  // Minify any css
  // result = result.replace(/\s*([,>+;:}{]{1})\s*/igms, (m, a) => a).replace(/(\;\})/igms, () => '}');

  // Minify the html
  // result = result.replace(/(\>)(?:\s+|\s+)(\<)/igms, (m, a, b) => a + b);

  // Return the resulting html string
  return result;
}

// Export the module
module.exports = { Render };