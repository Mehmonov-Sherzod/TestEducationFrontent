// Run: node add-subjects.cjs
// Deletes existing subjects and adds 8 new subjects with 3 language translations

const https = require('https');

const API_BASE = 'https://localhost:5001';

const subjects = [
  { name: 'Matematika', uz: 'Matematika', rus: 'Математика', eng: 'Mathematics' },
  { name: 'Fizika', uz: 'Fizika', rus: 'Физика', eng: 'Physics' },
  { name: 'Kimyo', uz: 'Kimyo', rus: 'Химия', eng: 'Chemistry' },
  { name: 'Biologiya', uz: 'Biologiya', rus: 'Биология', eng: 'Biology' },
  { name: 'Ingliz tili', uz: 'Ingliz tili', rus: 'Английский язык', eng: 'English' },
  { name: 'Ona tili', uz: "O'zbek tili", rus: 'Узбекский язык', eng: 'Uzbek Language' },
  { name: 'Tarix', uz: 'Tarix', rus: 'История', eng: 'History' },
  { name: 'Geografiya', uz: 'Geografiya', rus: 'География', eng: 'Geography' },
];

// Ignore self-signed certificate (for localhost)
const agent = new https.Agent({ rejectUnauthorized: false });

async function deleteSubject(id) {
  return new Promise((resolve, reject) => {
    const url = new URL(`/api/Subject/${id}`, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'DELETE',
      agent: agent,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, id });
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
}

async function createSubject(subject) {
  const data = JSON.stringify({
    Name: subject.name,
    SubjectTranslates: [
      { LanguageId: 0, ColumnName: 'SubjectName', TranslateText: subject.uz },
      { LanguageId: 1, ColumnName: 'SubjectName', TranslateText: subject.rus },
      { LanguageId: 2, ColumnName: 'SubjectName', TranslateText: subject.eng },
    ]
  });

  return new Promise((resolve, reject) => {
    const url = new URL('/api/Subject', API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      agent: agent,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result, subject: subject.name });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, subject: subject.name });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

async function main() {
  // Delete existing subjects (IDs 5-20)
  console.log('Deleting existing subjects...\n');
  for (let id = 5; id <= 20; id++) {
    try {
      const result = await deleteSubject(id);
      if (result.status === 200) {
        console.log(`🗑️  Deleted subject ID: ${id}`);
      } else {
        console.log(`⚠️  Could not delete ID ${id} (may not exist)`);
      }
    } catch (error) {
      console.log(`⚠️  Error deleting ID ${id}:`, error.message);
    }
  }

  console.log('\nAdding 8 subjects with 3 language translations...\n');

  for (const subject of subjects) {
    try {
      const result = await createSubject(subject);
      if (result.status === 200 && result.data.Succeeded) {
        console.log(`✅ ${subject.name}`);
        console.log(`   UZ: ${subject.uz}`);
        console.log(`   RU: ${subject.rus}`);
        console.log(`   EN: ${subject.eng}`);
        console.log(`   ID: ${result.data.Result?.Id}\n`);
      } else {
        console.log(`❌ ${subject.name} - Failed:`, result.data.Errors || result.data);
      }
    } catch (error) {
      console.log(`❌ ${subject.name} - Error:`, error.message);
    }
  }

  console.log('Done!');
}

main();
