const fs = require('fs');
const path = require('path');

const files = [
  'c:\\Users\\El Picho\\Documents\\Proyectos NextJS\\todowp\\messages\\es.json',
  'c:\\Users\\El Picho\\Documents\\Proyectos NextJS\\todowp\\messages\\en.json'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace the key "marketplace" with "products"
  content = content.replace(/"marketplace":/g, '"products":');
  
  // Replace the translation string "Marketplace" with "Productos" (or "Products" for en)
  if (file.includes('es.json')) {
    content = content.replace(/"Marketplace"/g, '"Productos"');
  } else {
    content = content.replace(/"Marketplace"/g, '"Products"');
  }
  
  fs.writeFileSync(file, content);
  console.log('Updated', file);
});
