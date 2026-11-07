import { readdir, readFile } from "node:fs/promises";

const dataDirectory = new URL("../public/data/", import.meta.url);
const optionKeys = ["OptionA", "OptionB", "OptionC", "OptionD"];
const units = {
  mm: ["length", 0.001], cm: ["length", 0.01], dm: ["length", 0.1],
  m: ["length", 1], km: ["length", 1000],
  g: ["mass", 1], kg: ["mass", 1000], t: ["mass", 1_000_000],
  ml: ["volume", 0.001], cl: ["volume", 0.01], dl: ["volume", 0.1], l: ["volume", 1],
};

// Parse only unambiguous standalone values, never prose or arbitrary expressions.
function numericValue(text) {
  const value = text.trim().replace(/\.$/, "").replace(/−/g, "-");
  const mixed = value.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed && Number(mixed[3]) !== 0) {
    return { amount: Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]), unit: "number" };
  }
  const fraction = value.match(/^(-?\d+)\/(\d+)$/);
  if (fraction && Number(fraction[2]) !== 0) {
    return { amount: Number(fraction[1]) / Number(fraction[2]), unit: "number" };
  }
  const number = value.match(/^(-?[\d\s]+(?:,\d+)?)\s*(%|[a-z²³]+)?$/i);
  if (!number) return null;
  const amount = Number(number[1].replace(/\s/g, "").replace(",", "."));
  const unit = number[2] || "number";
  if (unit === "%") return { amount: amount / 100, unit: "number" };
  if (units[unit]) return { amount: amount * units[unit][1], unit: units[unit][0] };
  return { amount, unit };
}

const errors = [];
let files = 0;
let questions = 0;
let images = 0;
for (const file of (await readdir(dataDirectory)).filter(file => file.endsWith(".json")).sort()) {
  if (file === "learning_tips.json") continue;
  let data;
  try {
    data = JSON.parse((await readFile(new URL(file, dataDirectory), "utf8")).replace(/^\uFEFF/, ""));
  } catch (error) {
    errors.push(`${file}: ${error.message}`);
    continue;
  }
  if (!Array.isArray(data.Questions) || !data.Questions.length) {
    errors.push(`${file}: expected a nonempty Questions array`);
    continue;
  }
  files++;
  for (const [index, question] of data.Questions.entries()) {
    const location = `${file}, question ${index + 1}`;
    questions++;
    if (!question || typeof question !== "object") {
      errors.push(`${location}: expected a question object`);
      continue;
    }
    if (typeof question.Question !== "string" || !question.Question.trim()) {
      errors.push(`${location}: missing question text`);
    }
    if (!optionKeys.includes(question.CorrectAnswer)) errors.push(`${location}: invalid CorrectAnswer key`);
    if (optionKeys.some(key => typeof question[key] !== "string" || !question[key].trim())) {
      errors.push(`${location}: expected four nonempty answer options`);
      continue;
    }
    // Some spelling exercises intentionally distinguish upper and lower case.
    const testsCase = /мала|голема|буква/i.test(question.Question);
    const options = optionKeys.map(key => {
      const text = question[key].normalize("NFC").trim().replace(/\s+/g, " ");
      return testsCase ? text : text.toLocaleLowerCase("mk");
    });
    if (new Set(options).size !== 4) errors.push(`${location}: duplicate answer options`);
    for (const key of optionKeys) {
      if (/^(?:Не знам|Можеби|Зависи|Понекогаш|И двете се точни)[.! ]*$/i.test(question[key])) {
        errors.push(`${location}: generic filler option in ${key}`);
      }
      if (/\bB{3,}\b|\uFFFD/.test(question[key])) errors.push(`${location}: placeholder or invalid text in ${key}`);
    }
    // Ordinal notation (e.g. "10." versus "10") is itself the learning objective.
    if (!/редни|реден|редниот|десетти/i.test(question.Question) && optionKeys.includes(question.CorrectAnswer)) {
      const correct = numericValue(question[question.CorrectAnswer]);
      for (const key of optionKeys.filter(key => key !== question.CorrectAnswer)) {
        const candidate = numericValue(question[key]);
        if (correct && candidate && correct.unit === candidate.unit && Math.abs(correct.amount - candidate.amount) < 1e-9) {
          errors.push(`${location}: ${key} is numerically equivalent to the correct answer`);
        }
      }
    }
    if (question.image !== undefined) {
      if (typeof question.image !== "string" || !question.image.trim()) errors.push(`${location}: invalid image`);
      else images++;
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${questions} questions across ${files} quiz files (${images} images).`);
  console.log("Checks cover structure, answer keys, duplicate options, filler text and equivalent numeric answers. Content still requires editorial review.");
}
