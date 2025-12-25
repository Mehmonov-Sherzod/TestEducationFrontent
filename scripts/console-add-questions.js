/**
 * Browser konsolida ishlatiladigan script
 * 100 ta matematik savol qo'shadi (30 easy, 40 medium, 30 hard)
 *
 * ISHLATISH:
 * 1. Frontend saytga kiring va ADMIN sifatida login qiling
 * 2. Browser DevTools oching (F12)
 * 3. Console tabiga o'ting
 * 4. Bu scriptni nusxalab, console ga joylang va Enter bosing
 * 5. addMathQuestions('TOPIC_ID') funksiyasini chaqiring
 *
 * Masalan: addMathQuestions('12345678-1234-1234-1234-123456789012')
 *
 * TopicId ni olish uchun:
 * - Topics sahifasiga boring
 * - Matematika fanining biror topic ustiga bosing
 * - URL dan yoki Network tabidan TopicId ni ko'ring
 */

const mathQuestions = {
  easy: [
    { q: "2 + 3 = ?", a: ["5", "4", "6", "7"], c: 0 },
    { q: "5 - 2 = ?", a: ["3", "2", "4", "1"], c: 0 },
    { q: "3 × 2 = ?", a: ["6", "5", "4", "8"], c: 0 },
    { q: "8 ÷ 2 = ?", a: ["4", "3", "5", "6"], c: 0 },
    { q: "10 + 5 = ?", a: ["15", "14", "16", "12"], c: 0 },
    { q: "7 - 4 = ?", a: ["3", "2", "4", "5"], c: 0 },
    { q: "4 × 3 = ?", a: ["12", "10", "14", "11"], c: 0 },
    { q: "9 ÷ 3 = ?", a: ["3", "2", "4", "6"], c: 0 },
    { q: "6 + 7 = ?", a: ["13", "12", "14", "11"], c: 0 },
    { q: "15 - 8 = ?", a: ["7", "6", "8", "9"], c: 0 },
    { q: "5 × 5 = ?", a: ["25", "20", "30", "15"], c: 0 },
    { q: "20 ÷ 4 = ?", a: ["5", "4", "6", "8"], c: 0 },
    { q: "11 + 9 = ?", a: ["20", "19", "21", "18"], c: 0 },
    { q: "18 - 9 = ?", a: ["9", "8", "10", "7"], c: 0 },
    { q: "6 × 4 = ?", a: ["24", "22", "26", "20"], c: 0 },
    { q: "16 ÷ 4 = ?", a: ["4", "3", "5", "6"], c: 0 },
    { q: "8 + 8 = ?", a: ["16", "15", "17", "14"], c: 0 },
    { q: "20 - 12 = ?", a: ["8", "7", "9", "10"], c: 0 },
    { q: "7 × 3 = ?", a: ["21", "20", "22", "18"], c: 0 },
    { q: "30 ÷ 5 = ?", a: ["6", "5", "7", "8"], c: 0 },
    { q: "14 + 6 = ?", a: ["20", "19", "21", "18"], c: 0 },
    { q: "25 - 10 = ?", a: ["15", "14", "16", "13"], c: 0 },
    { q: "8 × 2 = ?", a: ["16", "14", "18", "12"], c: 0 },
    { q: "24 ÷ 6 = ?", a: ["4", "3", "5", "6"], c: 0 },
    { q: "9 + 11 = ?", a: ["20", "19", "21", "18"], c: 0 },
    { q: "30 - 15 = ?", a: ["15", "14", "16", "13"], c: 0 },
    { q: "9 × 2 = ?", a: ["18", "16", "20", "14"], c: 0 },
    { q: "36 ÷ 6 = ?", a: ["6", "5", "7", "8"], c: 0 },
    { q: "12 + 13 = ?", a: ["25", "24", "26", "23"], c: 0 },
    { q: "50 - 25 = ?", a: ["25", "24", "26", "20"], c: 0 },
  ],
  medium: [
    { q: "15 × 12 = ?", a: ["180", "170", "190", "160"], c: 0 },
    { q: "144 ÷ 12 = ?", a: ["12", "11", "13", "14"], c: 0 },
    { q: "√64 = ?", a: ["8", "6", "7", "9"], c: 0 },
    { q: "3² + 4² = ?", a: ["25", "24", "26", "23"], c: 0 },
    { q: "2³ = ?", a: ["8", "6", "9", "4"], c: 0 },
    { q: "45 + 67 = ?", a: ["112", "110", "114", "108"], c: 0 },
    { q: "123 - 78 = ?", a: ["45", "43", "47", "44"], c: 0 },
    { q: "18 × 6 = ?", a: ["108", "106", "110", "104"], c: 0 },
    { q: "156 ÷ 12 = ?", a: ["13", "12", "14", "11"], c: 0 },
    { q: "√100 = ?", a: ["10", "9", "11", "12"], c: 0 },
    { q: "5² - 3² = ?", a: ["16", "14", "18", "12"], c: 0 },
    { q: "4³ = ?", a: ["64", "48", "72", "56"], c: 0 },
    { q: "89 + 56 = ?", a: ["145", "143", "147", "141"], c: 0 },
    { q: "200 - 87 = ?", a: ["113", "111", "115", "110"], c: 0 },
    { q: "25 × 8 = ?", a: ["200", "190", "210", "180"], c: 0 },
    { q: "225 ÷ 15 = ?", a: ["15", "14", "16", "13"], c: 0 },
    { q: "√144 = ?", a: ["12", "11", "13", "14"], c: 0 },
    { q: "6² + 8² = ?", a: ["100", "98", "102", "96"], c: 0 },
    { q: "3⁴ = ?", a: ["81", "64", "72", "90"], c: 0 },
    { q: "156 + 289 = ?", a: ["445", "443", "447", "441"], c: 0 },
    { q: "500 - 237 = ?", a: ["263", "261", "265", "260"], c: 0 },
    { q: "32 × 15 = ?", a: ["480", "470", "490", "460"], c: 0 },
    { q: "288 ÷ 16 = ?", a: ["18", "17", "19", "16"], c: 0 },
    { q: "√196 = ?", a: ["14", "13", "15", "16"], c: 0 },
    { q: "7² - 5² = ?", a: ["24", "22", "26", "20"], c: 0 },
    { q: "2⁵ = ?", a: ["32", "24", "36", "28"], c: 0 },
    { q: "234 + 567 = ?", a: ["801", "799", "803", "797"], c: 0 },
    { q: "1000 - 456 = ?", a: ["544", "542", "546", "540"], c: 0 },
    { q: "45 × 22 = ?", a: ["990", "980", "1000", "970"], c: 0 },
    { q: "√256 = ?", a: ["16", "15", "17", "18"], c: 0 },
    { q: "9² = ?", a: ["81", "72", "90", "63"], c: 0 },
    { q: "125 ÷ 5 = ?", a: ["25", "24", "26", "23"], c: 0 },
    { q: "78 + 94 = ?", a: ["172", "170", "174", "168"], c: 0 },
    { q: "350 - 178 = ?", a: ["172", "170", "174", "168"], c: 0 },
    { q: "16 × 16 = ?", a: ["256", "246", "266", "236"], c: 0 },
    { q: "324 ÷ 18 = ?", a: ["18", "17", "19", "16"], c: 0 },
    { q: "11² = ?", a: ["121", "111", "131", "110"], c: 0 },
    { q: "√225 = ?", a: ["15", "14", "16", "13"], c: 0 },
    { q: "67 + 89 = ?", a: ["156", "154", "158", "152"], c: 0 },
    { q: "400 - 167 = ?", a: ["233", "231", "235", "230"], c: 0 },
  ],
  hard: [
    { q: "log₁₀(1000) = ?", a: ["3", "2", "4", "10"], c: 0 },
    { q: "sin(90°) = ?", a: ["1", "0", "-1", "0.5"], c: 0 },
    { q: "cos(0°) = ?", a: ["1", "0", "-1", "0.5"], c: 0 },
    { q: "5! (faktorial) = ?", a: ["120", "60", "24", "720"], c: 0 },
    { q: "(2³)² = ?", a: ["64", "32", "128", "16"], c: 0 },
    { q: "∛27 = ?", a: ["3", "9", "6", "4"], c: 0 },
    { q: "2⁸ = ?", a: ["256", "128", "512", "64"], c: 0 },
    { q: "17² = ?", a: ["289", "279", "299", "269"], c: 0 },
    { q: "∛125 = ?", a: ["5", "25", "6", "4"], c: 0 },
    { q: "6! = ?", a: ["720", "120", "360", "480"], c: 0 },
    { q: "log₂(64) = ?", a: ["6", "4", "8", "5"], c: 0 },
    { q: "tan(45°) = ?", a: ["1", "0", "√2", "2"], c: 0 },
    { q: "sin(30°) = ?", a: ["0.5", "1", "0", "√3/2"], c: 0 },
    { q: "13² = ?", a: ["169", "159", "179", "149"], c: 0 },
    { q: "∛1000 = ?", a: ["10", "100", "31", "32"], c: 0 },
    { q: "7! ÷ 5! = ?", a: ["42", "21", "56", "35"], c: 0 },
    { q: "log₁₀(10000) = ?", a: ["4", "3", "5", "2"], c: 0 },
    { q: "cos(60°) = ?", a: ["0.5", "1", "0", "√3/2"], c: 0 },
    { q: "sin(45°) = ?", a: ["√2/2", "1", "0.5", "√3/2"], c: 0 },
    { q: "19² = ?", a: ["361", "351", "371", "341"], c: 0 },
    { q: "2⁹ = ?", a: ["512", "256", "1024", "128"], c: 0 },
    { q: "∛216 = ?", a: ["6", "36", "7", "8"], c: 0 },
    { q: "8! ÷ 6! = ?", a: ["56", "28", "42", "72"], c: 0 },
    { q: "log₂(256) = ?", a: ["8", "6", "7", "9"], c: 0 },
    { q: "tan(60°) = ?", a: ["√3", "1", "2", "√2"], c: 0 },
    { q: "21² = ?", a: ["441", "431", "451", "421"], c: 0 },
    { q: "3⁵ = ?", a: ["243", "81", "729", "162"], c: 0 },
    { q: "∛512 = ?", a: ["8", "64", "9", "7"], c: 0 },
    { q: "log₁₀(100000) = ?", a: ["5", "4", "6", "3"], c: 0 },
    { q: "23² = ?", a: ["529", "519", "539", "509"], c: 0 },
  ]
};

async function createQuestion(topicId, q, level) {
  const token = localStorage.getItem('auth-storage');
  let authToken = '';
  if (token) {
    try {
      const parsed = JSON.parse(token);
      authToken = parsed.state?.token || '';
    } catch(e) {
      console.error('Token parse xatosi:', e);
    }
  }

  if (!authToken) {
    console.error('Token topilmadi! Iltimos login qiling.');
    return { Succeeded: false, Errors: ['Token topilmadi'] };
  }

  const levelMap = { easy: 0, medium: 1, hard: 2 };

  const body = {
    QuestionText: q.q,
    TopicId: topicId,
    Level: levelMap[level],
    Translate: [{ LanguageId: 0, ColumnName: "QuestionText", TranslateText: q.q }],
    Answers: q.a.map((ans, i) => ({
      Text: ans,
      IsCorrect: i === q.c,
      Translate: [{ LanguageId: 0, ColumnName: "Text", TranslateText: ans }]
    }))
  };

  try {
    const res = await fetch('/api/QuestionAnswer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Fetch xatosi:', err);
    return { Succeeded: false, Errors: [err.message] };
  }
}

async function addMathQuestions(topicId) {
  if (!topicId) {
    console.log('%c TopicId kerak!', 'color: red; font-size: 16px;');
    console.log('%c Masalan: addMathQuestions("12345678-1234-1234-1234-123456789012")', 'color: yellow;');
    console.log('%c TopicId ni Topics sahifasidan oling', 'color: cyan;');
    return;
  }

  console.log('%c 100 ta matematik savol qo\'shilmoqda...', 'color: cyan; font-size: 18px;');
  console.log('%c TopicId: ' + topicId, 'color: yellow;');

  let success = 0, errors = 0;

  // Easy (30)
  console.log('%c Easy savollar (30 ta)...', 'color: green; font-weight: bold;');
  for (let i = 0; i < 30; i++) {
    const r = await createQuestion(topicId, mathQuestions.easy[i], 'easy');
    if (r.Succeeded) {
      success++;
    } else {
      errors++;
      console.log('%c Easy ' + (i+1) + ' xato:', 'color: red;', r.Errors || r);
    }
  }
  console.log('%c Easy: ' + success + '/30', 'color: green;');

  // Medium (40)
  const s1 = success;
  console.log('%c Medium savollar (40 ta)...', 'color: orange; font-weight: bold;');
  for (let i = 0; i < 40; i++) {
    const r = await createQuestion(topicId, mathQuestions.medium[i], 'medium');
    if (r.Succeeded) {
      success++;
    } else {
      errors++;
      console.log('%c Medium ' + (i+1) + ' xato:', 'color: red;', r.Errors || r);
    }
  }
  console.log('%c Medium: ' + (success - s1) + '/40', 'color: orange;');

  // Hard (30)
  const s2 = success;
  console.log('%c Hard savollar (30 ta)...', 'color: red; font-weight: bold;');
  for (let i = 0; i < 30; i++) {
    const r = await createQuestion(topicId, mathQuestions.hard[i], 'hard');
    if (r.Succeeded) {
      success++;
    } else {
      errors++;
      console.log('%c Hard ' + (i+1) + ' xato:', 'color: red;', r.Errors || r);
    }
  }
  console.log('%c Hard: ' + (success - s2) + '/30', 'color: red;');

  console.log('');
  console.log('%c ═══════════════════════════════════', 'color: cyan;');
  console.log('%c  Jami muvaffaqiyatli: ' + success + '/100', 'color: lime; font-size: 16px;');
  console.log('%c  Jami xatolar: ' + errors, 'color: red; font-size: 16px;');
  console.log('%c ═══════════════════════════════════', 'color: cyan;');

  return { success, errors };
}

// Global funksiya sifatida
window.addMathQuestions = addMathQuestions;

console.log('%c Script yuklandi!', 'color: lime; font-size: 18px;');
console.log('%c Ishlatish:', 'color: cyan; font-size: 14px;');
console.log('%c   addMathQuestions("TOPIC_ID")', 'color: yellow; font-size: 14px;');
console.log('%c TopicId ni Topics sahifasidan oling', 'color: gray;');
