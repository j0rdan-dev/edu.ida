import { seededRandom, shuffle } from "./gameRandom";

export const DATA_ROUND_COUNT = 10;
export type DataTask = "survey" | "bars" | "pictogram" | "compare" | "line" | "venn" | "pie" | "mode" | "chance" | "spinner" | "experiment";
export type VennRegion = "left" | "both" | "right" | "outside";
export interface ChanceEvent { prompt: string; favorable: number; total: number; answer: string; reason: string; }
export interface DataMission {
  id: string; chapter: "data"; kind: "data"; task: DataTask;
  title: string; prompt: string; shortPrompt: string; hint: string; explanation: string; answer: string;
  chartTitle: string; labels: string[]; values: number[]; raw: number[]; scale: number; maximum: number;
  unit: string; target: number; targetIndex: number; otherIndex: number; symbolValue: number; total: number;
  choices: { id: string; label: string }[]; modes: number[]; slots: number[]; outcomes: number[];
  events: ChanceEvent[]; model: "die" | "coin" | "two-dice"; operation: "read" | "difference" | "trend";
}
// Printed pages reviewed in the supplied books. Grade 5's PDF page is printed page + 1.
export const dataTextbookReferences = [
  { grade: 4, topic: "Работа со податоци", pages: [327, 328, 330, 333, 336, 340, 343, 347, 348, 350, 352] },
  { grade: 5, topic: "Работа со податоци", pages: [282, 283, 284, 285, 286, 287, 289, 290, 291] },
];
export const dataColors = ["#9fbdac", "#baa6ce", "#d9b779", "#8fb8ce"];
export const chanceChoices = [
  { id: "never", label: "Невозможно" }, { id: "maybe", label: "Можно, несигурно" }, { id: "always", label: "Сигурно" },
];
export const vennChoices: { id: VennRegion; label: string }[] = [
  { id: "left", label: "Само парни" }, { id: "both", label: "Во пресекот" },
  { id: "right", label: "Само > 10" }, { id: "outside", label: "Надвор" },
];
export const vennRegion = (n: number): VennRegion => n % 2 === 0 ? n > 10 ? "both" : "left" : n > 10 ? "right" : "outside";
export const classifyChance = (favorable: number, total: number) => favorable === 0 ? "never" : favorable === total ? "always" : "maybe";
export function dataModes(values: number[]): number[] {
  const counts = new Map<number, number>();
  values.forEach(n => counts.set(n, (counts.get(n) ?? 0) + 1));
  const most = Math.max(0, ...counts.values());
  return most <= 1 ? [] : [...counts].filter(([, count]) => count === most).map(([n]) => n).sort((a, b) => a - b);
}

export const dataGameDetails = {
  id: "data" as const, slug: "data-detective", name: "Детектив за податоци", title: "Работилница за податоци и веројатност", shortTitle: "Податоци",
  badge: "Детектив за податоци", emoji: "📊", color: "lavender", subject: "Математика", gradeLevels: [4, 5], action: "Откриј ја приказната во бројките",
  description: "Собери гласови, изгради дијаграм и донеси одлука. Истражи што е сигурно, можно или невозможно со коцка и тркало на бои.",
  takeaway: "Податоците ни помагаат да донесуваме одлуки. Еден случаен резултат не ни кажува со сигурност што ќе се случи следно.",
  lesson: [
    "Со анкета собираме одговори на исто прашање. Секој одговор го запишуваме еднаш. Во табела со цртички секоја цртичка е еден одговор, а петтата ги прецртува претходните четири. Збирот на зачестеностите е бројот на одговори.",
    "Столбестиот дијаграм споредува категории. Прочитај ги насловот, ознаките на оските и скалата: едно деление може да вреди 1, 2, 5 или повеќе единици. Во пиктограм секоја сликичка вреди онолку колку што пишува во легендата.",
    "Линискиот дијаграм прикажува промена низ време. Линија нагоре значи зголемување, надолу намалување, а хоризонтална линија нема промена. Кружниот дијаграм прикажува делови од едно цело. Прво најди колку вреди еден еднаков дел.",
    "Во Венов дијаграм, во пресекот одат податоците што ги исполнуваат двата услови. Надвор од круговите одат оние што не исполнуваат ниту еден. Мода е податокот што најчесто се повторува. Може да има повеќе моди; ако секој податок се појавува само еднаш, нема мода.",
    "Сигурен настан се случува при секој можен исход, невозможен при ниту еден, а можен, но несигурен настан при некои исходи. Кај правилна коцка, броевите од 1 до 6 имаат еднаква можност. Кај тркало со еднакви полиња, бојата со повеќе полиња е поверојатна.",
    "Со експеримент собираме резултати и ги запишуваме во табела. Повеќе појавувања во десет фрлања не значат дека тој број мора да падне следниот пат. Случајните резултати може да бидат различни при секое повторување.",
  ],
};

export function createDataRounds(advanced: boolean, seed: number): DataMission[] {
  const random = seededRandom(seed);
  const int = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
  const pick = <T,>(items: readonly T[]) => items[int(0, items.length - 1)];
  const tasks = shuffle<DataTask>(["survey", "bars", "pictogram", "compare", "line", advanced ? "pie" : "venn", advanced ? "mode" : "chance", "chance", "spinner", "experiment"], random);
  let chanceIndex = 0;
  return tasks.map((task, index): DataMission => {
    const scale = advanced ? pick([2, 5]) : pick([1, 2]);
    const base: DataMission = { id: `data-${seed}-${index}`, chapter: "data", kind: "data", task,
      title: "Детектив за податоци", prompt: "", shortPrompt: "", hint: "", explanation: "", answer: "",
      chartTitle: "", labels: ["Јаболко", "Банана", "Круша", "Јагода"], values: shuffle([2, 3, 4, 5, 6], random).slice(0, 4).map(n => n * scale),
      raw: [], scale, maximum: 6 * scale, unit: "гласа", target: 0, targetIndex: int(0, 3), otherIndex: 0, symbolValue: 1, total: 0,
      choices: [], modes: [], slots: [], outcomes: [], events: [], model: "die", operation: "read" };
    if (task === "survey") {
      const counts = shuffle([2, 3, 1, advanced ? 6 : 5], random);
      const raw = shuffle(counts.flatMap((n, i) => Array<number>(n).fill(i)), random);
      return { ...base, values: counts, raw, answer: "recorded", chartTitle: "Омилено овошје", title: "Собери ги гласовите",
        shortPrompt: "Запиши го секој глас во точниот ред од табелата.",
        prompt: "Во одделението прашуваме: „Кое овошје го избираш за ужина?“ Прочитај го одговорот на картичката и допри го соодветното овошје. Секој ученик гласа еднаш. Запиши ги сите гласови во табелата со цртички.",
        hint: "Еден одговор значи една цртичка во редот со тоа овошје. Секој петти глас прави група од пет. Број ги гласовите, а не различните овошја.",
        explanation: `Собравме ${raw.length} одговори: ${base.labels.map((label, i) => `${label} ${counts[i]}`).join(", ")}. Збирот ${counts.join(" + ")} = ${raw.length} е бројот на ученици што гласале. Табелата ни помага да испланираме ужина според нивниот избор.` };
    }
    if (task === "bars") return { ...base, answer: base.values.join(":"), chartTitle: "Избор за училишна ужина", title: "Изгради столбест дијаграм",
      shortPrompt: "Пренеси ги гласовите од табелата во столбовите.",
      prompt: `Податоците над дијаграмот се резултати од анкета. Избери овошје и намести ја висината на неговиот столб. Можеш да го допреш дијаграмот или да ги користиш копчињата и полето за број. Едно деление вреди ${scale} гласа. Провери кога сите четири столба се точни.`,
      hint: `Скалата оди по ${scale}. Првиот столб треба да има висина ${base.values[0]} гласа, односно ${base.values[0] / scale} деленија. Потоа провери ги и другите категории.`,
      explanation: `Столбовите ги прикажуваат истите податоци како табелата: ${base.labels.map((label, i) => `${label} ${base.values[i]}`).join(", ")}. Нулата и еднаквите деленија од по ${scale} ни овозможуваат правилно да ги споредиме гласовите.` };
    if (task === "pictogram") {
      const symbolValue = advanced ? pick([4, 5]) : 2;
      const values = shuffle([2, 3, 4, 5], random).map(n => n * symbolValue);
      const target = values[base.targetIndex];
      return { ...base, values, symbolValue, target, unit: "ученици", answer: String(target), chartTitle: "Како доаѓаме на училиште?", labels: ["Пеш", "Велосипед", "Автобус", "Автомобил"], title: "Прочитај ја легендата",
        shortPrompt: `Колку ученици доаѓаат ${["пеш", "со велосипед", "со автобус", "со автомобил"][base.targetIndex]}?`,
        prompt: `Во пиктограмот секоја сликичка претставува ${symbolValue} ученици. Пресметај колку ученици доаѓаат ${["пеш", "со велосипед", "со автобус", "со автомобил"][base.targetIndex]}. Внеси го бројот на ученици, а не бројот на сликички.`,
        hint: `Прочитај ја легендата. Изброј ги сликичките во бараниот ред и помножи со ${symbolValue}.`,
        explanation: `Во бараниот ред има ${target / symbolValue} сликички. Секоја означува ${symbolValue} ученици: ${target / symbolValue} · ${symbolValue} = ${target} ученици. Без легендата не би знаеле колку вреди сликичката.` };
    }
    if (task === "compare") {
      const pair = shuffle([0, 1, 2, 3], random).slice(0, 2).sort((a, b) => base.values[b] - base.values[a]);
      const target = base.values[pair[0]] - base.values[pair[1]], labels = ["Книги", "Игри", "Спорт", "Цртање"];
      return { ...base, labels, targetIndex: pair[0], otherIndex: pair[1], target, answer: String(target), operation: "difference", chartTitle: "Избор на работилница", title: "Планирај ги работилниците",
        shortPrompt: `Колку гласа повеќе има „${labels[pair[0]]}“ од „${labels[pair[1]]}“?`,
        prompt: `Учениците гласале за работилници. Прочитај го столбестиот дијаграм. За колку гласови изборот „${labels[pair[0]]}“ го надминува изборот „${labels[pair[1]]}“? Ова ни помага да споредиме за кои активности има поголем интерес.`,
        hint: `Види колку вреди едно деление. Од бројот за „${labels[pair[0]]}“ одземи го бројот за „${labels[pair[1]]}“.`,
        explanation: `„${labels[pair[0]]}“ има ${base.values[pair[0]]}, а „${labels[pair[1]]}“ има ${base.values[pair[1]]} гласа. Разликата е ${base.values[pair[0]]} − ${base.values[pair[1]]} = ${target} гласа. Одлуката ја засноваме врз податоците од анкетата.` };
    }
    if (task === "line") {
      const labels = ["Пон", "Вто", "Сре", "Чет", "Пет"], values = Array.from({ length: 5 }, () => int(1, 6) * scale), targetIndex = int(0, advanced ? 3 : 4);
      const difference = values[targetIndex + 1] - values[targetIndex];
      const answer = advanced ? difference > 0 ? "up" : difference < 0 ? "down" : "same" : String(values[targetIndex]);
      return { ...base, labels, values, targetIndex, target: values[targetIndex], answer, unit: "шишиња", operation: advanced ? "trend" : "read", chartTitle: "Собрани шишиња по ден", title: "Следи ја еко-акцијата",
        choices: advanced ? [{ id: "up", label: "Се зголемува ↗" }, { id: "same", label: "Нема промена →" }, { id: "down", label: "Се намалува ↘" }] : [],
        shortPrompt: advanced ? `Како се менува бројот од ${labels[targetIndex]} до ${labels[targetIndex + 1]}?` : `Колку шишиња се собрани во ${["понеделник", "вторник", "среда", "четврток", "петок"][targetIndex]}?`,
        prompt: advanced ? `Линискиот дијаграм го прикажува бројот на собрани шишиња секој ден. Спореди ги соседните точки за ${labels[targetIndex]} и ${labels[targetIndex + 1]}. Дали бројот се зголемува, се намалува или останува ист?` : `На линискиот дијаграм се прикажани собраните шишиња по ден. Прочитај ја точката за ${labels[targetIndex]} и внеси го бројот. Можеш да допреш точка или да избереш ден за да ја истражиш скалата.`,
        hint: "Деновите се на долната оска, броевите на левата. Линија нагоре значи зголемување, надолу намалување, а хоризонтално нема промена.",
        explanation: advanced ? `Од ${labels[targetIndex]} (${values[targetIndex]}) до ${labels[targetIndex + 1]} (${values[targetIndex + 1]}) бројот ${difference > 0 ? "се зголемува" : difference < 0 ? "се намалува" : "не се менува"}. Линијата го покажува правецот на промената.` : `Точката за ${labels[targetIndex]} е на ${values[targetIndex]} шишиња. Секое деление на скалата вреди ${scale}. Линискиот дијаграм ни помага да ја следиме акцијата низ неделата.` };
    }
    if (task === "venn") {
      const raw = shuffle([pick([2, 4, 6, 8, 10]), pick([12, 14, 16, 18, 20]), pick([11, 13, 15, 17, 19]), pick([1, 3, 5, 7, 9])], random);
      return { ...base, raw, answer: "sorted", title: "Подреди во Венов дијаграм", chartTitle: "Парни броеви и броеви > 10",
        shortPrompt: "Постави ја секоја картичка во точната област.",
        prompt: "Левиот круг е за парни броеви, десниот за броеви поголеми од 10. Постави ја секоја картичка во точната област. Во пресекот одат броевите што ги исполнуваат двата услови, а надвор оние што не исполнуваат ниту еден.",
        hint: "За секој број провери два услова: дали е парен и дали е поголем од 10. Ако двата одговора се да, избери го пресекот.",
        explanation: `${raw.map(n => `${n}: ${vennChoices.find(c => c.id === vennRegion(n))!.label.toLowerCase()}`).join("; ")}. Веновиот дијаграм ни помага да ги организираме податоците според два услова одеднаш.` };
    }
    if (task === "pie") {
      const parts = shuffle(pick([[4, 2, 1, 1], [6, 3, 2, 1]]), random), divisions = parts.reduce((a, b) => a + b, 0), total = divisions * int(3, 7);
      const target = parts[base.targetIndex] * total / divisions, labels = ["Фудбал", "Кошарка", "Пливање", "Тенис"];
      return { ...base, labels, values: parts, symbolValue: total / divisions, total, target, answer: String(target), unit: "ученици", chartTitle: `Омилен спорт · ${total} ученици`, title: "Деловите ја прават целината",
        shortPrompt: `Анкета со ${total} ученици. Колку избрале „${labels[base.targetIndex]}“?`,
        prompt: `Кружниот дијаграм прикажува избор на ${total} ученици и има ${divisions} еднакви делови. Прочитај ја легендата, изброј ги деловите за „${labels[base.targetIndex]}“ и пресметај го бројот на ученици. Допри категорија за да ги означиш нејзините делови.`,
        hint: `Еден дел вреди ${total} : ${divisions} ученици. Помножи со бројот на делови за бараниот спорт.`,
        explanation: `Еден од ${divisions} еднакви делови претставува ${total} : ${divisions} = ${total / divisions} ученици. „${labels[base.targetIndex]}“ зафаќа ${parts[base.targetIndex]} делови: ${parts[base.targetIndex]} · ${total / divisions} = ${target} ученици.` };
    }
    if (task === "mode") {
      const labels = shuffle([String(int(31, 33)), "34", "35", "36"], random);
      const counts = shuffle(pick([[4, 2, 1, 1], [3, 3, 1, 1], [1, 1, 1, 1]]), random);
      const raw = shuffle(counts.flatMap((n, i) => Array<number>(n).fill(Number(labels[i]))), random), modes = dataModes(raw);
      return { ...base, labels, raw, modes, values: counts, answer: modes.length ? modes.join(":") : "none", chartTitle: "Број на обувки во групата", title: "Откриј што се повторува",
        shortPrompt: "Најди ги сите моди на броевите на обувки.",
        prompt: "Прикажани се броевите на обувки на учениците во една група. Означи ги сите броеви што се појавуваат најчесто. Ако секој се појавува само еднаш, избери „Нема мода“. Со копчето за подредување можеш да ги наредиш броевите.",
        hint: "Бројот што е најголем по вредност не мора да е мода! Изброј колку пати се појавува секој број. Понекогаш повеќе броеви се повторуваат подеднакво најчесто.",
        explanation: modes.length ? `${labels.map((n, i) => `${n} се појавува ${counts[i]} пати`).join(", ")}. ${modes.length > 1 ? "Модите се" : "Модата е"} ${modes.join(" и ")}, затоа што ${modes.length > 1 ? "се појавуваат" : "се појавува"} најчесто.` : "Секој број се појавува само еднаш. Во оваа група податоци нема мода." };
    }
    if (task === "chance") {
      const model = advanced ? "two-dice" : chanceIndex++ === 0 ? "die" : "coin";
      const rolled = int(1, 6), sum = int(2, 12);
      const possibleSums = Array.from({ length: 36 }, (_, i) => 1 + i % 6 + 1 + Math.floor(i / 6));
      const specs = model === "coin" ? [
        { prompt: "Падна писмо или грб.", favorable: 2, total: 2, reason: "Ова се двете можни страни на монетата во нашиот модел." },
        { prompt: "Падна бројот 7 на монетата од 1 денар.", favorable: 0, total: 2, reason: "Ниту една страна на монетата нема број 7." },
        { prompt: "Падна писмо.", favorable: 1, total: 2, reason: "Може да падне писмо, но може да падне и грб." },
      ] : model === "die" ? [
        { prompt: "Падна број од 1 до 6.", favorable: 6, total: 6, reason: "Секој од шесте можни исходи го исполнува условот." },
        { prompt: `Падна ${int(7, 10)}.`, favorable: 0, total: 6, reason: "Коцката има само броеви од 1 до 6." },
        { prompt: `Падна ${rolled}.`, favorable: 1, total: 6, reason: `Бројот ${rolled} може да падне, но не при секое фрлање.` },
      ] : [
        { prompt: "Збирот е од 2 до 12.", favorable: 36, total: 36, reason: "Најмалиот збир е 1 + 1 = 2, најголемиот 6 + 6 = 12." },
        { prompt: `Збирот е ${int(13, 18)}.`, favorable: 0, total: 36, reason: "Збирот на две коцки не може да биде поголем од 12." },
        { prompt: `Збирот е ${sum}.`, favorable: possibleSums.filter(n => n === sum).length, total: 36, reason: `Збирот ${sum} може да се добие, но има и други можни збирови.` },
      ];
      const events = shuffle(specs.map(event => ({ ...event, answer: classifyChance(event.favorable, event.total) })), random);
      return { ...base, model, events, answer: "classified", title: "Сигурно, можно или невозможно?", chartTitle: model === "coin" ? "Монета од 1 денар" : model === "die" ? "Правилна коцка · 1 до 6" : "Две правилни коцки · секоја од 1 до 6",
        shortPrompt: "Процени ги настаните: сигурно, можно или невозможно?",
        prompt: `Разгледуваме ${model === "coin" ? "фрлање монета што паѓа на една од двете страни: писмо или грб" : model === "die" ? "едно фрлање правилна коцка со броеви од 1 до 6" : "фрлање две правилни коцки и го собираме бројот на точките"}. За секоја картичка избери дали настанот е сигурен, можен но несигурен, или невозможен.`,
        hint: "Сигурно: условот важи за сите можни исходи. Невозможно: не важи за ниту еден. Можно, но несигурно: важи за некои исходи.",
        explanation: events.map(event => `${event.prompt} ${chanceChoices.find(c => c.id === event.answer)!.label}. ${event.reason}`).join(" ") };
    }
    if (task === "spinner") {
      const values = shuffle(advanced ? pick([[3, 3, 2], [4, 3, 1], [5, 2, 1]]) : pick([[4, 2, 2], [3, 3, 2]]), random);
      const labels = ["Зелено", "Виолетово", "Жолто"], targetIndex = int(0, 2), otherIndex = (targetIndex + int(1, 2)) % 3;
      const slots = shuffle(values.flatMap((n, i) => Array<number>(n).fill(i)), random);
      const answer = values[targetIndex] === values[otherIndex] ? "equal" : values[targetIndex] > values[otherIndex] ? "first" : "second";
      return { ...base, labels, values, slots, targetIndex, otherIndex, answer, outcomes: Array.from({ length: 20 }, () => int(0, 7)), chartTitle: "Тркало со 8 еднакви полиња", title: "Истражи го тркалото",
        choices: [{ id: "first", label: labels[targetIndex] }, { id: "equal", label: "Подеднакво" }, { id: "second", label: labels[otherIndex] }],
        shortPrompt: `Што е поверојатно: ${labels[targetIndex].toLowerCase()} или ${labels[otherIndex].toLowerCase()}?`,
        prompt: `Тркалото има 8 еднакви полиња и секое има еднаква можност. Спореди ги боите ${labels[targetIndex].toLowerCase()} и ${labels[otherIndex].toLowerCase()}. Избери која е поверојатна или дали се подеднакво веројатни. Можеш да го завртиш тркалото до 20 пати, но одговорот засновај го врз полињата.`,
        hint: "Изброј ги еднаквите полиња за двете бои. Повеќе полиња значат поголема можност. Еден резултат од вртење не е доказ за следниот.",
        explanation: `${labels[targetIndex]} има ${values[targetIndex]} од 8 полиња, а ${labels[otherIndex]} има ${values[otherIndex]} од 8. ${answer === "equal" ? "Можностите се еднакви." : `${answer === "first" ? labels[targetIndex] : labels[otherIndex]} е поверојатно, но не е сигурно.`} Секое вртење е нов обид; претходните резултати не го одредуваат следниот.` };
    }
    const outcomes = Array.from({ length: 10 }, () => int(1, 6)), targetIndex = int(1, 6), target = outcomes.filter(n => n === targetIndex).length;
    return { ...base, outcomes, targetIndex, target, answer: String(target), unit: "пати", chartTitle: "Резултати од 10 фрлања", title: "Направи мал експеримент",
      shortPrompt: `Фрли 10 пати и запиши. Колку пати падна ${targetIndex}?`,
      prompt: `Фрли ја виртуелната правилна коцка 10 пати. По секое фрлање запиши го добиениот број со соодветното копче. На крај прочитај ја табелата и внеси колку пати паднал бројот ${targetIndex}. Нема потреба да го погодиш следното фрлање.`,
      hint: `Едно фрлање додава една цртичка во точниот ред. На крај бројот на сите записи мора да биде 10. Прочитај го редот за ${targetIndex}; можно е да има и нула појавувања.`,
      explanation: `Во овие 10 фрлања бројот ${targetIndex} се појави ${target} пати. Ги запишавме сите 10 исходи. Ова е резултат од нашиот експеримент; не значи дека можеме сигурно да го предвидиме следното фрлање. Секој број на правилна коцка има еднаква можност при секое ново фрлање.` };
  });
}
