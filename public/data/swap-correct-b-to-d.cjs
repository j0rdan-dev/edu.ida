// in order to run this script execute following command
// node public/data/swap-correct-b-to-d.cjs
const fs = require('fs');

const filePath = 'c:/Repos/edu.ida/public/data/4-struktura_imenki_zamenki_glagoli_pridavki.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const bIndexes = data.Questions
  .map((q, i) => q.CorrectAnswer === 'OptionB' ? i : -1)
  .filter(i => i !== -1);

const numberOfSwaps = 3; // Change this to the desired number of swaps
const shuffled = bIndexes.sort(() => 0.5 - Math.random()).slice(0, numberOfSwaps);

shuffled.forEach(i => {
  const q = data.Questions[i];
  // Swap OptionB and OptionD
  const temp = q.OptionB;
  q.OptionB = q.OptionD;
  q.OptionD = temp;
  q.CorrectAnswer = 'OptionD';
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('Done!');