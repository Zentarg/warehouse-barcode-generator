const fs = require('fs');
const path = require('path');

const ymlFilePath = path.join(__dirname, '../dist-electron/latest.yml');

// Read the latest.yml file
fs.readFile(ymlFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading latest.yml:', err);
    return;
  }

  // Replace spaces with dots in the URL and path
  const updatedData = data.replace(/Warehouse-Barcode-Generator-Setup/g, 'Warehouse.Barcode.Generator.Setup');

  // Write the updated data back to the latest.yml file
  fs.writeFile(ymlFilePath, updatedData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing latest.yml:', err);
      return;
    }
    console.log('latest.yml updated successfully.');
  });
});