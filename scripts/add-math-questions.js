/**
 * Matematika fani uchun 100 ta savol qo'shish scripti
 * 30 ta Easy, 40 ta Medium, 30 ta Hard
 *
 * Ishlatish: node scripts/add-math-questions.js
 */

const API_BASE = 'https://localhost:7164'; // Backend URL - o'zgartiring agar kerak bo'lsa

// Matematik savollar bazasi
const mathQuestions = {
  easy: [
    { q: "2 + 3 = ?", answers: ["5", "4", "6", "7"], correct: 0 },
    { q: "5 - 2 = ?", answers: ["3", "2", "4", "1"], correct: 0 },
    { q: "3 × 2 = ?", answers: ["6", "5", "4", "8"], correct: 0 },
    { q: "8 ÷ 2 = ?", answers: ["4", "3", "5", "6"], correct: 0 },
    { q: "10 + 5 = ?", answers: ["15", "14", "16", "12"], correct: 0 },
    { q: "7 - 4 = ?", answers: ["3", "2", "4", "5"], correct: 0 },
    { q: "4 × 3 = ?", answers: ["12", "10", "14", "11"], correct: 0 },
    { q: "9 ÷ 3 = ?", answers: ["3", "2", "4", "6"], correct: 0 },
    { q: "6 + 7 = ?", answers: ["13", "12", "14", "11"], correct: 0 },
    { q: "15 - 8 = ?", answers: ["7", "6", "8", "9"], correct: 0 },
    { q: "5 × 5 = ?", answers: ["25", "20", "30", "15"], correct: 0 },
    { q: "20 ÷ 4 = ?", answers: ["5", "4", "6", "8"], correct: 0 },
    { q: "11 + 9 = ?", answers: ["20", "19", "21", "18"], correct: 0 },
    { q: "18 - 9 = ?", answers: ["9", "8", "10", "7"], correct: 0 },
    { q: "6 × 4 = ?", answers: ["24", "22", "26", "20"], correct: 0 },
    { q: "16 ÷ 4 = ?", answers: ["4", "3", "5", "6"], correct: 0 },
    { q: "8 + 8 = ?", answers: ["16", "15", "17", "14"], correct: 0 },
    { q: "20 - 12 = ?", answers: ["8", "7", "9", "10"], correct: 0 },
    { q: "7 × 3 = ?", answers: ["21", "20", "22", "18"], correct: 0 },
    { q: "30 ÷ 5 = ?", answers: ["6", "5", "7", "8"], correct: 0 },
    { q: "14 + 6 = ?", answers: ["20", "19", "21", "18"], correct: 0 },
    { q: "25 - 10 = ?", answers: ["15", "14", "16", "13"], correct: 0 },
    { q: "8 × 2 = ?", answers: ["16", "14", "18", "12"], correct: 0 },
    { q: "24 ÷ 6 = ?", answers: ["4", "3", "5", "6"], correct: 0 },
    { q: "9 + 11 = ?", answers: ["20", "19", "21", "18"], correct: 0 },
    { q: "30 - 15 = ?", answers: ["15", "14", "16", "13"], correct: 0 },
    { q: "9 × 2 = ?", answers: ["18", "16", "20", "14"], correct: 0 },
    { q: "36 ÷ 6 = ?", answers: ["6", "5", "7", "8"], correct: 0 },
    { q: "12 + 13 = ?", answers: ["25", "24", "26", "23"], correct: 0 },
    { q: "50 - 25 = ?", answers: ["25", "24", "26", "20"], correct: 0 },
  ],
  medium: [
    { q: "15 × 12 = ?", answers: ["180", "170", "190", "160"], correct: 0 },
    { q: "144 ÷ 12 = ?", answers: ["12", "11", "13", "14"], correct: 0 },
    { q: "√64 = ?", answers: ["8", "6", "7", "9"], correct: 0 },
    { q: "3² + 4² = ?", answers: ["25", "24", "26", "23"], correct: 0 },
    { q: "2³ = ?", answers: ["8", "6", "9", "4"], correct: 0 },
    { q: "45 + 67 = ?", answers: ["112", "110", "114", "108"], correct: 0 },
    { q: "123 - 78 = ?", answers: ["45", "43", "47", "44"], correct: 0 },
    { q: "18 × 6 = ?", answers: ["108", "106", "110", "104"], correct: 0 },
    { q: "156 ÷ 12 = ?", answers: ["13", "12", "14", "11"], correct: 0 },
    { q: "√100 = ?", answers: ["10", "9", "11", "12"], correct: 0 },
    { q: "5² - 3² = ?", answers: ["16", "14", "18", "12"], correct: 0 },
    { q: "4³ = ?", answers: ["64", "48", "72", "56"], correct: 0 },
    { q: "89 + 56 = ?", answers: ["145", "143", "147", "141"], correct: 0 },
    { q: "200 - 87 = ?", answers: ["113", "111", "115", "110"], correct: 0 },
    { q: "25 × 8 = ?", answers: ["200", "190", "210", "180"], correct: 0 },
    { q: "225 ÷ 15 = ?", answers: ["15", "14", "16", "13"], correct: 0 },
    { q: "√144 = ?", answers: ["12", "11", "13", "14"], correct: 0 },
    { q: "6² + 8² = ?", answers: ["100", "98", "102", "96"], correct: 0 },
    { q: "3⁴ = ?", answers: ["81", "64", "72", "90"], correct: 0 },
    { q: "156 + 289 = ?", answers: ["445", "443", "447", "441"], correct: 0 },
    { q: "500 - 237 = ?", answers: ["263", "261", "265", "260"], correct: 0 },
    { q: "32 × 15 = ?", answers: ["480", "470", "490", "460"], correct: 0 },
    { q: "288 ÷ 16 = ?", answers: ["18", "17", "19", "16"], correct: 0 },
    { q: "√196 = ?", answers: ["14", "13", "15", "16"], correct: 0 },
    { q: "7² - 5² = ?", answers: ["24", "22", "26", "20"], correct: 0 },
    { q: "2⁵ = ?", answers: ["32", "24", "36", "28"], correct: 0 },
    { q: "234 + 567 = ?", answers: ["801", "799", "803", "797"], correct: 0 },
    { q: "1000 - 456 = ?", answers: ["544", "542", "546", "540"], correct: 0 },
    { q: "45 × 22 = ?", answers: ["990", "980", "1000", "970"], correct: 0 },
    { q: "√256 = ?", answers: ["16", "15", "17", "18"], correct: 0 },
    { q: "9² = ?", answers: ["81", "72", "90", "63"], correct: 0 },
    { q: "125 ÷ 5 = ?", answers: ["25", "24", "26", "23"], correct: 0 },
    { q: "78 + 94 = ?", answers: ["172", "170", "174", "168"], correct: 0 },
    { q: "350 - 178 = ?", answers: ["172", "170", "174", "168"], correct: 0 },
    { q: "16 × 16 = ?", answers: ["256", "246", "266", "236"], correct: 0 },
    { q: "324 ÷ 18 = ?", answers: ["18", "17", "19", "16"], correct: 0 },
    { q: "11² = ?", answers: ["121", "111", "131", "110"], correct: 0 },
    { q: "√225 = ?", answers: ["15", "14", "16", "13"], correct: 0 },
    { q: "67 + 89 = ?", answers: ["156", "154", "158", "152"], correct: 0 },
    { q: "400 - 167 = ?", answers: ["233", "231", "235", "230"], correct: 0 },
  ],
  hard: [
    { q: "√(169 + 256) = ?", answers: ["√425", "20", "21", "19"], correct: 2 },
    { q: "log₁₀(1000) = ?", answers: ["3", "2", "4", "10"], correct: 0 },
    { q: "sin(90°) = ?", answers: ["1", "0", "-1", "0.5"], correct: 0 },
    { q: "cos(0°) = ?", answers: ["1", "0", "-1", "0.5"], correct: 0 },
    { q: "5! = ?", answers: ["120", "60", "24", "720"], correct: 0 },
    { q: "(2³)² = ?", answers: ["64", "32", "128", "16"], correct: 0 },
    { q: "∛27 = ?", answers: ["3", "9", "6", "4"], correct: 0 },
    { q: "2⁸ = ?", answers: ["256", "128", "512", "64"], correct: 0 },
    { q: "17² = ?", answers: ["289", "279", "299", "269"], correct: 0 },
    { q: "∛125 = ?", answers: ["5", "25", "6", "4"], correct: 0 },
    { q: "6! = ?", answers: ["720", "120", "360", "480"], correct: 0 },
    { q: "log₂(64) = ?", answers: ["6", "4", "8", "5"], correct: 0 },
    { q: "tan(45°) = ?", answers: ["1", "0", "√2", "2"], correct: 0 },
    { q: "sin(30°) = ?", answers: ["0.5", "1", "0", "√3/2"], correct: 0 },
    { q: "13² = ?", answers: ["169", "159", "179", "149"], correct: 0 },
    { q: "∛1000 = ?", answers: ["10", "100", "31", "32"], correct: 0 },
    { q: "7! ÷ 5! = ?", answers: ["42", "21", "56", "35"], correct: 0 },
    { q: "log₁₀(10000) = ?", answers: ["4", "3", "5", "2"], correct: 0 },
    { q: "cos(60°) = ?", answers: ["0.5", "1", "0", "√3/2"], correct: 0 },
    { q: "sin(45°) = ?", answers: ["√2/2", "1", "0.5", "√3/2"], correct: 0 },
    { q: "19² = ?", answers: ["361", "351", "371", "341"], correct: 0 },
    { q: "2⁹ = ?", answers: ["512", "256", "1024", "128"], correct: 0 },
    { q: "∛216 = ?", answers: ["6", "36", "7", "8"], correct: 0 },
    { q: "8! ÷ 6! = ?", answers: ["56", "28", "42", "72"], correct: 0 },
    { q: "log₂(256) = ?", answers: ["8", "6", "7", "9"], correct: 0 },
    { q: "tan(60°) = ?", answers: ["√3", "1", "2", "√2"], correct: 0 },
    { q: "21² = ?", answers: ["441", "431", "451", "421"], correct: 0 },
    { q: "3⁵ = ?", answers: ["243", "81", "729", "162"], correct: 0 },
    { q: "∛512 = ?", answers: ["8", "64", "9", "7"], correct: 0 },
    { q: "log₁₀(100000) = ?", answers: ["5", "4", "6", "3"], correct: 0 },
  ]
};

// API chaqirish funksiyasi
async function createQuestion(topicId, questionData, level) {
  const levelMap = { easy: 0, medium: 1, hard: 2 };

  const body = {
    QuestionText: questionData.q,
    TopicId: topicId,
    Level: levelMap[level],
    Translate: [
      {
        LanguageId: 0, // uz
        ColumnName: "QuestionText",
        TranslateText: questionData.q
      }
    ],
    Answers: questionData.answers.map((answer, index) => ({
      Text: answer,
      IsCorrect: index === questionData.correct,
      Translate: [
        {
          LanguageId: 0, // uz
          ColumnName: "Text",
          TranslateText: answer
        }
      ]
    }))
  };

  try {
    const response = await fetch(`${API_BASE}/api/QuestionAnswer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (data.Succeeded) {
      return { success: true, id: data.Result?.Id };
    } else {
      return { success: false, error: data.Errors?.join(', ') || 'Unknown error' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Asosiy funksiya
async function main() {
  // TopicId ni bu yerga qo'ying - Matematika fanining biror topic ID si
  const TOPIC_ID = process.argv[2];

  if (!TOPIC_ID) {
    console.log('❌ TopicId kerak!');
    console.log('Ishlatish: node scripts/add-math-questions.js <TOPIC_ID>');
    console.log('Masalan: node scripts/add-math-questions.js 12345678-1234-1234-1234-123456789012');
    process.exit(1);
  }

  console.log('🚀 Matematika savollari qo\'shilmoqda...');
  console.log(`📁 TopicId: ${TOPIC_ID}`);
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  // Easy savollar (30 ta)
  console.log('📗 Easy savollar (30 ta)...');
  for (let i = 0; i < 30; i++) {
    const result = await createQuestion(TOPIC_ID, mathQuestions.easy[i], 'easy');
    if (result.success) {
      successCount++;
      process.stdout.write(`✅ Easy ${i + 1}/30\r`);
    } else {
      errorCount++;
      console.log(`❌ Easy ${i + 1} xato: ${result.error}`);
    }
  }
  console.log(`✅ Easy savollar: ${successCount - errorCount}/30`);

  // Medium savollar (40 ta)
  console.log('📙 Medium savollar (40 ta)...');
  const mediumStart = successCount;
  for (let i = 0; i < 40; i++) {
    const result = await createQuestion(TOPIC_ID, mathQuestions.medium[i], 'medium');
    if (result.success) {
      successCount++;
      process.stdout.write(`✅ Medium ${i + 1}/40\r`);
    } else {
      errorCount++;
      console.log(`❌ Medium ${i + 1} xato: ${result.error}`);
    }
  }
  console.log(`✅ Medium savollar: ${successCount - mediumStart}/40`);

  // Hard savollar (30 ta)
  console.log('📕 Hard savollar (30 ta)...');
  const hardStart = successCount;
  for (let i = 0; i < 30; i++) {
    const result = await createQuestion(TOPIC_ID, mathQuestions.hard[i], 'hard');
    if (result.success) {
      successCount++;
      process.stdout.write(`✅ Hard ${i + 1}/30\r`);
    } else {
      errorCount++;
      console.log(`❌ Hard ${i + 1} xato: ${result.error}`);
    }
  }
  console.log(`✅ Hard savollar: ${successCount - hardStart}/30`);

  console.log('');
  console.log('═══════════════════════════════════');
  console.log(`✅ Jami muvaffaqiyatli: ${successCount}`);
  console.log(`❌ Jami xatolar: ${errorCount}`);
  console.log('═══════════════════════════════════');
}

main().catch(console.error);
