const fs = require('fs');
const Airtable = require('airtable');
const dotenv = fs.readFileSync('.env', 'utf8');
const keyMatch = dotenv.match(/VITE_AIRTABLE_ACCESS_TOKEN="([^"]+)"/);
const baseMatch = dotenv.match(/VITE_AIRTABLE_BASE_ID="([^"]+)"/);
const key = keyMatch[1];
const baseId = baseMatch[1];
const base = new Airtable({ apiKey: key }).base(baseId);
base('Facilities & Clients').select({ maxRecords: 1 }).firstPage().then(records => {
  console.log(JSON.stringify(Object.keys(records[0].fields)));
}).catch(err => console.error(err));
