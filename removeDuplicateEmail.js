const fs = require('fs');
const csv = require('csv-parser');
const ObjectsToCsv = require('objects-to-csv');

const uniqueEmails = new Set(); // Create a set to store unique email addresses

fs.createReadStream('input.csv') // Open the CSV file as a readable stream
  .pipe(csv()) // Parse the CSV data using csv-parser
  .on('data', (row) => {
    // For each row of data, add the email address to the set
    uniqueEmails.add(row.Email);
  })
  .on('end', () => {
    // When the end of the CSV file is reached, write the unique email addresses to a new file
    const outputData = [...uniqueEmails].map((email) => ({ email }));
    const outputCsv = new ObjectsToCsv(outputData);
    outputCsv.toDisk('output.csv', { append: false });
  });