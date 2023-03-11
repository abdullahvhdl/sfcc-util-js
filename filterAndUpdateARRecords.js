const fs = require('fs');
const xml2js = require('xml2js');

// Read the input XML file
const inputFile = 'NARS-CA-AR.xml';
const inputXml = fs.readFileSync(inputFile, 'utf8');

// Parse the input XML
xml2js.parseString(inputXml, (err, result) => {
  if (err) {
    console.error(err);
    return;
  }

  const compareDateStr = "2023-03-16T05:00:00.000+0000";
  const currentCompareDate = new Date(compareDateStr);

  var emailList = [];

  // var x = JSON.parse(result);
  console.info(result['custom-objects']['custom-object']);

  // Filter the nodes based on the date attribute
  const filteredNodes = result['custom-objects']['custom-object'].filter(node => {
    const nextScheduledDate = node['object-attribute'].find(attr => attr['$']['attribute-id'] === 'NextScheduledDate')['_'];
    console.info(nextScheduledDate)
    const nodeDate = new Date(nextScheduledDate);
    node['object-attribute'].find(attr => attr['$']['attribute-id'] === 'NextScheduledDate')['_'] = "2023-03-16T05:00:00.000+0000";
    if (nodeDate <= currentCompareDate){
        emailList.push(node['object-attribute'].find(attr => attr['$']['attribute-id'] === 'CustomerID')['_']);
    }
    
    return nodeDate <= currentCompareDate;
  });

  console.info(filteredNodes.length);
  console.info(emailList);

  // Create a new XML object with the filtered nodes
  const outputXmlObj = { 'custom-objects': { 'custom-object': filteredNodes } };

  // Convert the new XML object to XML string
  const xmlBuilder = new xml2js.Builder({ encoding: 'UTF-8' });
  const outputXml = xmlBuilder.buildObject(outputXmlObj);

  // Write the new XML string to a file
  const outputFile = 'output.xml';
  fs.writeFileSync(outputFile, outputXml, 'utf8');

  //writing email list to file
  const createCsvWriter = require('csv-writer').createObjectCsvWriter;

  // Set up the CSV writer
    const csvWriter = createCsvWriter({
        path: 'emailList.csv',
        header: [
        { id: 'email', title: 'Email' }
        ]
    });

    // Map the array of emails to an array of objects with 'email' property
    const data = emailList.map((email) => {
        return { email: email };
    });

    // Write the data to the CSV file
    csvWriter.writeRecords(data)
    .then(() => {
    console.log('CSV file written successfully');
    })
    .catch((err) => {
    console.error(err);
    });

});
