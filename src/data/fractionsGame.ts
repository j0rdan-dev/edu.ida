import { seededRandom, shuffle } from "./gameRandom";

export const FRACTIONS_ROUND_COUNT = 10;
export type FractionTask = "portion" | "quantity" | "compare" | "equivalent" | "line" | "mixed";
export interface Fraction { numerator: number; denominator: number; }
export interface FractionMission {
  id: string; chapter: "fractions"; kind: "fractions"; task: FractionTask;
  title: string; prompt: string; shortPrompt: string; hint: string; explanation: string; answer: string;
  fraction: Fraction; other: Fraction; total: number; unit: string; context: "pizza" | "chocolate" | "apples" | "biscuits" | "drink" | "time" | "ribbon";
  divisions: number; target: number; whole: number; remainder: number;
}
// Printed pages reviewed in the supplied PDFs. Grade 5's PDF page is printed page + 1.
export const fractionsTextbookReferences = [
  { grade: 4, topic: "Дропки", pages: [71, 74, 77, 80, 84, 87, 91] },
  { grade: 5, topic: "Дропки", pages: [43, 45, 46, 48, 49, 52] },
];
export const fractionText = (f: Fraction) => `${f.numerator}/${f.denominator}`;
export const fractionCompare = (a: Fraction, b: Fraction) => Math.sign(a.numerator * b.denominator - b.numerator * a.denominator);
export const fractionRelations = [
  { id: "less", symbol: "<", label: "Помало од" }, { id: "equal", symbol: "=", label: "Еднакво на" }, { id: "greater", symbol: ">", label: "Поголемо од" },
];
export const fractionsGameDetails = {
  id: "fractions" as const, slug: "fractions-in-action", name: "Дропки во акција", title: "Истражи ги дропките", shortTitle: "Дропки",
  badge: "Мајстор на дропките", emoji: "🍕", color: "peach", subject: "Математика", gradeLevels: [4, 5], action: "Играј со дропки",
  description: "Подели пица, одмери сок и избери дел од кошница со овошје. Откриј како дропките ни помагаат секој ден.",
  takeaway: "Дропката покажува дел од цело поделено на еднакви делови. Различни дропки можат да означуваат иста количина.",
  lesson: [
    "Именителот кажува на колку еднакви делови е поделено целото. Броителот кажува колку од тие делови земаме. На пример, 3/4 значи три од четири еднакви делови.",
    "За да најдеш дел од количина, прво подели ја целата количина со именителот, па помножи со броителот. На пример, 3/4 од 20 јаболка е (20 : 4) · 3 = 15 јаболка.",
    "Споредувај дропки од исто цело. Кога именителите се еднакви, поголема е дропката со поголем броител. Кај единечните дропки, поголем именител значи помал дел: 1/8 од пица е помалку од 1/4 од истата пица.",
    "Еднаквите (еквивалентни) дропки означуваат иста количина: 1/2 = 2/4 = 4/8. Кога секој дел ќе го поделиме на два еднакви помали дела, и броителот и именителот се удвојуваат, а количината останува иста.",
    "На бројната права, растојанието од 0 до 1 е едно цело. Подели го на еднакви растојанија и брои ги чекорите од нулата. На лента од 1 метар, 3/4 е три од четири еднакви делови.",
    "Мешаниот број има цел дел и правилна дропка. Пет половини пица се две цели пици и уште една половина: 5/2 = 2 1/2. Секоја цела пица мора да има иста големина и ист број еднакви парчиња.",
  ],
};

export function createFractionRounds(advanced: boolean, seed: number): FractionMission[] {
  const random = seededRandom(seed);
  const pick = <T,>(items: readonly T[]) => items[Math.floor(random() * items.length)];
  const int = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
  const tasks = shuffle<FractionTask>(["portion", "portion", "quantity", "quantity", "compare", "compare", "equivalent", "equivalent", "line", "mixed"], random);
  const portions = shuffle(["pizza", "chocolate"] as const, random);
  const equivalences = shuffle(advanced ? [2, 3, 4, 5, 6] : [2, 3, 4], random);
  let quantityIndex = 0, comparisonIndex = 0;
  return tasks.map((task, index): FractionMission => {
    const denominator = pick(advanced ? [3, 4, 5, 6, 8, 10, 12] : [2, 3, 4, 5, 6, 8]);
    const fraction = { numerator: int(1, denominator - 1), denominator };
    const base: FractionMission = { id: `fractions-${seed}-${index}`, chapter: "fractions", kind: "fractions", task, fraction,
      other: { numerator: 0, denominator: 1 }, total: 1, unit: "", context: "pizza", divisions: denominator, target: fraction.numerator,
      whole: 0, remainder: 0, title: "Дропки во акција", prompt: "", shortPrompt: "", hint: "", explanation: "", answer: "" };
    if (task === "portion") {
      const context = portions.pop()!;
      const object = context === "pizza" ? "пицата" : "чоколадото";
      return { ...base, context, answer: String(fraction.numerator), title: "Подготви ја ужината", shortPrompt: `Оддели ${fractionText(fraction)} од ${object}.`,
        prompt: `Целото е поделено на ${denominator} еднакви делови. Избери ${fractionText(fraction)} од ${object}. Допри парче за да го одделиш или вратиш. Можеш да ги користиш и нумерираните копчиња.`,
        hint: `Именителот ${denominator} го покажува бројот на сите еднакви делови. Броителот кажува колку да одделиш.`,
        explanation: `Од ${denominator} еднакви делови одделивме ${fraction.numerator}. Тоа е ${fractionText(fraction)} од ${object}. Местото на избраните парчиња не ја менува количината.` };
    }
    if (task === "quantity") {
      const secondQuantity = quantityIndex++ === 1;
      const measuring = advanced && secondQuantity;
      const context = measuring ? pick(["drink", "time"] as const) : secondQuantity ? "biscuits" : "apples";
      const den = measuring ? pick(context === "drink" ? [2, 4, 5, 10] : [2, 3, 4, 5, 6]) : pick([2, 3, 4, 5, 6]);
      const f = { numerator: int(1, den - 1), denominator: den };
      const total = measuring ? context === "drink" ? 1000 : 60 : den * int(advanced ? 3 : 2, advanced ? 8 : 5);
      const unit = context === "drink" ? "ml" : context === "time" ? "минути" : context === "apples" ? "јаболка" : "бисквити";
      const target = total / den * f.numerator;
      const shortPrompt = context === "drink" ? `Одмери ${fractionText(f)} од шише со ${total} ml сок.` : context === "time" ? `Колку минути се ${fractionText(f)} од час од 60 минути?` : `Избери ${fractionText(f)} од ${total} ${unit}.`;
      return { ...base, context, fraction: f, total, unit, target, answer: String(target), title: "Дропка од количина", shortPrompt, prompt: `${shortPrompt} Намести ја количината со копчињата или внеси број, па провери. Замисли ја целата количина поделена на ${den} еднакви дела.`,
        hint: `Прво најди 1/${den} од целата количина: подели ${total} со ${den}. Потоа земи ${f.numerator} такви дела.`,
        explanation: `Еден од ${den} еднакви дела е ${total} : ${den} = ${total / den} ${unit}. Затоа ${fractionText(f)} од ${total} ${unit} е ${total / den} · ${f.numerator} = ${target} ${unit}.` };
    }
    if (task === "compare") {
      const sameDenominator = comparisonIndex++ === 0;
      const a = sameDenominator ? fraction : { numerator: advanced ? int(1, 3) : 1, denominator: pick([4, 6, 8]) };
      const b = sameDenominator ? { numerator: denominator === 2 ? 1 : pick(Array.from({ length: denominator - 1 }, (_, i) => i + 1).filter(n => n !== fraction.numerator)), denominator }
        : random() < .3 ? { numerator: a.numerator * 2, denominator: a.denominator * 2 } : { numerator: advanced ? int(1, 3) : 1, denominator: pick([3, 4, 6, 8]) };
      const relation = fractionCompare(a, b);
      const answer = relation === 0 ? "equal" : relation < 0 ? "less" : "greater";
      return { ...base, fraction: a, other: b, context: "chocolate", answer, title: "Спореди ги ужините", shortPrompt: `Спореди ${fractionText(a)} и ${fractionText(b)} од еднакви чоколади.`,
        prompt: "Двете чоколади се со иста големина. Спореди ги дропките и избери <, = или >. Со „Види ги деловите“ можеш да ја провериш својата замисла пред да одговориш.",
        hint: sameDenominator ? "Кога деловите се еднакви по големина, спореди колку од нив се земени." : "Двете цели чоколади се еднакви. Различен број делови може да претставува иста количина. Погледни ги обоените должини.",
        explanation: `${fractionText(a)} ${relation === 0 ? "=" : relation < 0 ? "<" : ">"} ${fractionText(b)}. ${relation === 0 ? "Двете дропки означуваат иста количина од еднакви цели чоколади." : "Споредуваме делови од еднакви цели чоколади; подолгиот обоен дел претставува поголема дропка."}` };
    }
    if (task === "equivalent") {
      const den = equivalences.pop()!;
      const f = { numerator: int(1, den - 1), denominator: den };
      const factor = pick(advanced ? [2, 3] : [2]);
      const other = { numerator: f.numerator * factor, denominator: den * factor };
      return { ...base, fraction: f, other, context: "drink", target: other.numerator, answer: String(other.numerator), title: "Иста количина, нови делови", shortPrompt: `Прикажи ${fractionText(f)} со ${other.denominator} еднакви делови.`,
        prompt: `Рецептот бара ${fractionText(f)} од чаша сок. Втората чаша е со иста големина, но е поделена на ${other.denominator} еднакви делови. Одбери колку од тие делови да наполниш за количината да биде иста.`,
        hint: `Секој од првите делови сега е поделен на ${factor} помали еднакви дела. Како се менува бројот на наполнети делови?`,
        explanation: `${fractionText(f)} = ${fractionText(other)}. Именителот е помножен со ${factor}, па и броителот се множи со ${factor}. Двете чаши содржат иста количина сок.` };
    }
    if (task === "line") {
      const den = pick([2, 3, 4, 5, 6]);
      const f = { numerator: int(1, den - 1), denominator: den };
      const divisions = den * (advanced ? 2 : 1);
      const target = f.numerator * divisions / den;
      return { ...base, fraction: f, context: "ribbon", divisions, target, answer: String(target), title: "Одмери ја лентата", shortPrompt: `Означи ${fractionText(f)} од лента долга 1 метар.`,
        prompt: `Целата лента од 0 до 1 метар е поделена на ${divisions} еднакви растојанија. Постави ја ознаката на ${fractionText(f)} метар. Допри ја скалата или користи ги стрелките, па провери.`,
        hint: `Број ги растојанијата од 0, а не цртите. ${advanced ? `На 1/${den} од метар му одговараат ${divisions / den} мали растојанија.` : `Секое мало растојание е 1/${den} од метар.`}`,
        explanation: `Ознаката е на ${target}/${divisions} метар, што е еднакво на ${fractionText(f)} метар. Целото растојание од 0 до 1 е еден метар.` };
    }
    const den = pick(advanced ? [3, 4, 5, 6, 8] : [2, 3, 4]);
    const whole = int(1, advanced ? 3 : 2), remainder = int(1, den - 1), pieces = whole * den + remainder;
    return { ...base, fraction: { numerator: pieces, denominator: den }, whole, remainder, context: "pizza", answer: `${whole}:${remainder}`, title: "Собери цели пици",
      shortPrompt: advanced ? `Прикажи ${pieces}/${den} пица како мешан број.` : `Собери ${pieces} парчиња во цели пици и остаток.`,
      prompt: `Секоја пица е поделена на ${den} еднакви парчиња. Имаш ${pieces} такви парчиња од пици со иста големина. Колку цели пици и колку парчиња ќе составиш? Остатокот треба да биде помал од една цела пица.`,
      hint: `Групирај по ${den} парчиња за една цела пица. Колку полни групи има и колку парчиња остануваат?`,
      explanation: `${pieces} : ${den} = ${whole} цели пици и остаток ${remainder} парчиња. Затоа ${pieces}/${den} = ${whole} ${remainder}/${den}. Едно преостанато парче е 1/${den} од пица.` };
  });
}
