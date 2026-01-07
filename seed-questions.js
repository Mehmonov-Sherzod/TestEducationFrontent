// Savollar qo'shish skripti
// Ishlatish: node seed-questions.js

const API_BASE = 'https://localhost:5001';

// Token - bu yerga login qilib olingan tokenni qo'ying
const TOKEN = 'YOUR_TOKEN_HERE';

// Fanlar va savol sonlari
const SUBJECTS_CONFIG = [
  // Majburiy fanlar - 100 tadan easy
  { name: 'Majburiy Matematika', total: 100, easy: 100, medium: 0, hard: 0 },
  { name: 'Majburiy Tarix', total: 100, easy: 100, medium: 0, hard: 0 },
  { name: 'Majburiy Ona Tili', total: 100, easy: 100, medium: 0, hard: 0 },
  // Asosiy fanlar - 200 tadan (50 easy, 100 medium, 50 hard)
  { name: 'Matematika', total: 200, easy: 50, medium: 100, hard: 50 },
  { name: 'Fizika', total: 200, easy: 50, medium: 100, hard: 50 },
];

// QuestionLevel enum
const Level = { Easy: 0, Medium: 1, Hard: 2 };

// Savol generatorlari
const questionGenerators = {
  'Majburiy Matematika': (i, level) => ({
    question: `${i}. Hisoblang: ${2 + i} + ${3 + i} = ?`,
    answers: [
      { text: `${5 + 2*i}`, correct: true },
      { text: `${4 + 2*i}`, correct: false },
      { text: `${6 + 2*i}`, correct: false },
      { text: `${7 + 2*i}`, correct: false },
    ]
  }),
  'Majburiy Tarix': (i, level) => ({
    question: `${i}. O'zbekiston tarixi bo'yicha ${i}-savol?`,
    answers: [
      { text: `To'g'ri javob ${i}`, correct: true },
      { text: `Noto'g'ri javob A`, correct: false },
      { text: `Noto'g'ri javob B`, correct: false },
      { text: `Noto'g'ri javob C`, correct: false },
    ]
  }),
  'Majburiy Ona Tili': (i, level) => ({
    question: `${i}. Ona tili grammatikasi bo'yicha ${i}-savol?`,
    answers: [
      { text: `To'g'ri javob ${i}`, correct: true },
      { text: `Noto'g'ri javob A`, correct: false },
      { text: `Noto'g'ri javob B`, correct: false },
      { text: `Noto'g'ri javob C`, correct: false },
    ]
  }),
  'Matematika': (i, level) => {
    const levelName = level === 0 ? 'oson' : level === 1 ? "o'rta" : 'qiyin';
    return {
      question: `${i}. Matematika (${levelName}): ${i * (level + 1)} × ${i + level} = ?`,
      answers: [
        { text: `${i * (level + 1) * (i + level)}`, correct: true },
        { text: `${i * (level + 1) * (i + level) + 1}`, correct: false },
        { text: `${i * (level + 1) * (i + level) - 1}`, correct: false },
        { text: `${i * (level + 1) * (i + level) + 2}`, correct: false },
      ]
    };
  },
  'Fizika': (i, level) => {
    const levelName = level === 0 ? 'oson' : level === 1 ? "o'rta" : 'qiyin';
    return {
      question: `${i}. Fizika (${levelName}): ${i}-savol - Jism tezligi ${i * 10} m/s. Bu necha km/soat?`,
      answers: [
        { text: `${i * 36} km/soat`, correct: true },
        { text: `${i * 10} km/soat`, correct: false },
        { text: `${i * 18} km/soat`, correct: false },
        { text: `${i * 72} km/soat`, correct: false },
      ]
    };
  },
};

async function fetchSubjects() {
  const res = await fetch(`${API_BASE}/api/Subject/get-all-page`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    },
    body: JSON.stringify({ PageNumber: 1, PageSize: 100, Search: '' })
  });
  const data = await res.json();
  if (data.Succeeded) {
    return data.Result.Values;
  }
  throw new Error('Fanlarni olishda xatolik: ' + JSON.stringify(data.Errors));
}

async function fetchTopics(subjectId) {
  const res = await fetch(`${API_BASE}/api/Topic/get-all-page`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    },
    body: JSON.stringify({ PageNumber: 1, PageSize: 100, Search: '', SubjectId: subjectId })
  });
  const data = await res.json();
  if (data.Succeeded) {
    return data.Result.Values || data.Result.values || [];
  }
  return [];
}

async function createTopic(subjectId, name) {
  const res = await fetch(`${API_BASE}/api/Topic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    },
    body: JSON.stringify({ TopicName: name, SubjectId: subjectId })
  });
  const data = await res.json();
  if (data.Succeeded) {
    return data.Result;
  }
  throw new Error('Mavzu yaratishda xatolik: ' + JSON.stringify(data.Errors));
}

async function createQuestion(subjectId, topicId, questionText, level, answers) {
  const formData = new FormData();
  formData.append('QuestionText', questionText);
  formData.append('TopicId', topicId);
  formData.append('SubjectId', subjectId);
  formData.append('Level', level.toString());

  answers.forEach((ans, idx) => {
    formData.append(`Answers[${idx}].Text`, ans.text);
    formData.append(`Answers[${idx}].IsCorrect`, ans.correct.toString());
  });

  const res = await fetch(`${API_BASE}/api/QuestionAnswer`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`
    },
    body: formData
  });

  const data = await res.json();
  return data;
}

async function main() {
  console.log('Savollar qo\'shish boshlandi...\n');

  // 1. Fanlarni olish
  console.log('Fanlar yuklanmoqda...');
  const subjects = await fetchSubjects();
  console.log(`${subjects.length} ta fan topildi\n`);

  for (const config of SUBJECTS_CONFIG) {
    const subject = subjects.find(s =>
      s.SubjectName?.toLowerCase() === config.name.toLowerCase() ||
      s.Name?.toLowerCase() === config.name.toLowerCase()
    );

    if (!subject) {
      console.log(`❌ "${config.name}" fani topilmadi, o'tkazib yuborildi`);
      continue;
    }

    const subjectId = subject.Id || subject.id;
    console.log(`\n📚 ${config.name} (ID: ${subjectId})`);

    // 2. Mavzularni olish yoki yaratish
    let topics = await fetchTopics(subjectId);
    let topicId;

    if (topics.length === 0) {
      console.log(`   Mavzu yo'q, yangi mavzu yaratilmoqda...`);
      const newTopic = await createTopic(subjectId, `${config.name} - Umumiy`);
      topicId = newTopic.Id || newTopic.id;
    } else {
      topicId = topics[0].Id || topics[0].id;
    }
    console.log(`   Mavzu ID: ${topicId}`);

    // 3. Savollar yaratish
    const generator = questionGenerators[config.name];
    if (!generator) {
      console.log(`   ⚠️ Generator topilmadi`);
      continue;
    }

    let created = 0;
    let errors = 0;

    // Easy savollar
    for (let i = 1; i <= config.easy; i++) {
      const q = generator(i, Level.Easy);
      const result = await createQuestion(subjectId, topicId, q.question, Level.Easy, q.answers);
      if (result.Succeeded) {
        created++;
        process.stdout.write(`\r   Easy: ${i}/${config.easy}`);
      } else {
        errors++;
      }
    }
    if (config.easy > 0) console.log(` ✅`);

    // Medium savollar
    for (let i = 1; i <= config.medium; i++) {
      const q = generator(i, Level.Medium);
      const result = await createQuestion(subjectId, topicId, q.question, Level.Medium, q.answers);
      if (result.Succeeded) {
        created++;
        process.stdout.write(`\r   Medium: ${i}/${config.medium}`);
      } else {
        errors++;
      }
    }
    if (config.medium > 0) console.log(` ✅`);

    // Hard savollar
    for (let i = 1; i <= config.hard; i++) {
      const q = generator(i, Level.Hard);
      const result = await createQuestion(subjectId, topicId, q.question, Level.Hard, q.answers);
      if (result.Succeeded) {
        created++;
        process.stdout.write(`\r   Hard: ${i}/${config.hard}`);
      } else {
        errors++;
      }
    }
    if (config.hard > 0) console.log(` ✅`);

    console.log(`   📊 Jami: ${created} ta savol qo'shildi, ${errors} ta xatolik`);
  }

  console.log('\n✅ Tayyor!');
}

main().catch(console.error);
