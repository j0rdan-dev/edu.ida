import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

// Source: matematika_3.pdf, printed pages 47–77 within the requested 47–78 range.
// Page 78 introduces the next topic, Операции со броеви, and is excluded.
// The page references below are editorial provenance; the exported JSON follows QuizData.
// All diagrams are original, precisely drawn SVGs rendered to embedded PNGs locally.
// Run: node scripts/generate-geometry-3.mjs (requires Playwright Chromium or Chrome).

const output = new URL("../public/data/matematika_3_geometrija_50_unique_images.json", import.meta.url);
const previewDirectory = new URL("../.tmp/geometry-3.local/", import.meta.url);
const ink = "#25334d";
const blue = "#2563eb";
const violet = "#7c3aed";
const teal = "#0f766e";
const amber = "#d97706";
const red = "#dc2626";
const escapeXml = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const text = (x, y, value, size = 26, color = ink) => `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="${size}" font-weight="600" fill="${color}">${escapeXml(value)}</text>`;
const line = (x1, y1, x2, y2, color = ink, width = 4, dashed = false) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" ${dashed ? 'stroke-dasharray="9 7"' : ""}/>`;
const rect = (x, y, w, h, fill = "#dbeafe", stroke = ink, width = 4) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
const circle = (x, y, r, fill = "white", stroke = ink, width = 4) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
const polygon = (points, fill = "#dbeafe", stroke = ink, width = 4) => `<polygon points="${points.map(p => p.join(",")).join(" ")}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round"/>`;
const path = (d, fill = "none", stroke = ink, width = 4, dashed = false) => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${dashed ? 'stroke-dasharray="9 7"' : ""}/>`;
const point = (x, y, name, dx = 0, dy = -24, color = ink) => circle(x, y, 6, color, color, 1) + (name ? text(x + dx, y + dy, name, 25, color) : "");
const regular = (n, x = 360, y = 225, radius = 145, rotation = -Math.PI / 2) => Array.from({ length: n }, (_, i) => [x + Math.cos(rotation + 2 * Math.PI * i / n) * radius, y + Math.sin(rotation + 2 * Math.PI * i / n) * radius]);
const shape = (n, fill = "#dbeafe", radius = 145, rotation = -Math.PI / 2) => polygon(regular(n, 360, 225, radius, rotation), fill);
const svg = content => `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="440" viewBox="0 0 720 440"><defs><radialGradient id="ball" cx="32%" cy="28%"><stop offset="0" stop-color="#dbeafe"/><stop offset="1" stop-color="#60a5fa"/></radialGradient></defs><rect width="720" height="440" fill="white"/>${content}</svg>`;

function segment(x1, y1, x2, y2, a, b, color = blue) {
  return line(x1, y1, x2, y2, color, 5) + point(x1, y1, a, 0, -26) + point(x2, y2, b, 0, -26);
}

function ruler(start, end, a, b) {
  let result = rect(60, 290, 600, 64, "#fef3c7", "#b45309", 2);
  for (let i = 0; i <= 100; i++) {
    const x = 60 + i * 6;
    result += line(x, 290, x, 290 + (i % 10 === 0 ? 24 : i % 5 === 0 ? 17 : 10), "#92400e", 1.5);
    if (i % 10 === 0) result += text(x, 337, i / 10, 20, "#92400e");
  }
  const x1 = 60 + start * 60;
  const x2 = 60 + end * 60;
  return result + text(636, 380, "cm", 24, "#92400e") + segment(x1, 210, x2, 210, a, b)
    + line(x1, 220, x1, 286, "#64748b", 2, true) + line(x2, 220, x2, 286, "#64748b", 2, true);
}

function cuboid(x = 225, y = 145, w = 205, h = 205, dx = 70, dy = 65, front = "#bfdbfe") {
  return line(x + dx, y - dy, x + dx, y + h - dy, "#94a3b8", 2, true)
    + line(x + dx, y + h - dy, x, y + h, "#94a3b8", 2, true)
    + line(x + dx, y + h - dy, x + w + dx, y + h - dy, "#94a3b8", 2, true)
    + polygon([[x, y], [x + dx, y - dy], [x + w + dx, y - dy], [x + w, y]], "#e0f2fe")
    + polygon([[x + w, y], [x + w + dx, y - dy], [x + w + dx, y + h - dy], [x + w, y + h]], "#93c5fd")
    + rect(x, y, w, h, front);
}

function cylinder(x = 360, top = 120, bottom = 315, rx = 110, ry = 35, can = false) {
  return path(`M ${x - rx} ${top} L ${x - rx} ${bottom} A ${rx} ${ry} 0 0 0 ${x + rx} ${bottom} L ${x + rx} ${top}`, "#ccfbf1")
    + `<ellipse cx="${x}" cy="${top}" rx="${rx}" ry="${ry}" fill="#f0fdfa" stroke="${ink}" stroke-width="4"/>`
    + path(`M ${x - rx} ${bottom} A ${rx} ${ry} 0 0 1 ${x + rx} ${bottom}`, "none", "#64748b", 2, true)
    + (can ? path(`M ${x - rx} ${top + 50} Q ${x} ${top + 85} ${x + rx} ${top + 50} L ${x + rx} ${bottom - 40} Q ${x} ${bottom - 5} ${x - rx} ${bottom - 40} Z`, "#fef3c7", "#d97706", 2) : "");
}

function clock(x, y, hour, label) {
  let result = circle(x, y, 70, "#f8fafc");
  for (const [number, dx, dy] of [[12, 0, -49], [3, 51, 0], [6, 0, 50], [9, -51, 0]]) result += text(x + dx, y + dy, number, 18);
  const angle = Math.PI * (hour / 6 - 0.5);
  result += line(x, y, x, y - 37, blue, 4) + line(x, y, x + Math.cos(angle) * 29, y + Math.sin(angle) * 29, red, 6) + circle(x, y, 4, ink, ink);
  return result + text(x, y + 98, label, 24);
}

const columns = ["А", "Б", "В", "Г", "Д", "Ѓ"];
const gridX = 210;
const gridY = 70;
const cell = 50;
const cellCenter = (column, row) => [gridX + (column - 0.5) * cell, gridY + (row - 0.5) * cell];
function grid(numericColumns = false) {
  let result = rect(gridX, gridY, 300, 300, "#f8fafc", "#94a3b8", 2);
  for (let i = 0; i <= 6; i++) {
    result += line(gridX + i * cell, gridY, gridX + i * cell, gridY + 300, "#94a3b8", 1.5);
    result += line(gridX, gridY + i * cell, gridX + 300, gridY + i * cell, "#94a3b8", 1.5);
    if (i < 6) result += text(gridX + (i + 0.5) * cell, 43, numericColumns ? i + 1 : columns[i], 24)
      + text(182, gridY + (i + 0.5) * cell, i + 1, 23);
  }
  return result;
}
function marker(column, row, color = violet, label = "") {
  const [x, y] = cellCenter(column, row);
  return circle(x, y, 15, color, color, 2) + (label ? text(x, y, label, 17, "white") : "");
}
function star(column, row) {
  const [x, y] = cellCenter(column, row);
  return polygon(Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 === 0 ? 20 : 9;
    return [x + Math.cos(-Math.PI / 2 + i * Math.PI / 5) * radius, y + Math.sin(-Math.PI / 2 + i * Math.PI / 5) * radius];
  }), "#fbbf24", "#92400e", 2);
}
function house(column, row) {
  const [x, y] = cellCenter(column, row);
  return rect(x - 15, y - 4, 30, 23, "#ffedd5", "#9a3412", 2)
    + polygon([[x - 21, y - 4], [x, y - 22], [x + 21, y - 4]], "#f87171", "#9a3412", 2)
    + rect(x - 4, y + 6, 8, 13, "#9a3412", "#9a3412", 1);
}
function tree(column, row) {
  const [x, y] = cellCenter(column, row);
  return rect(x - 4, y, 8, 21, "#92400e", "#92400e", 1) + circle(x, y - 7, 17, "#86efac", "#166534", 2);
}
function car(column, row) {
  const [x, y] = cellCenter(column, row);
  return polygon([[x - 18, y - 3], [x - 10, y - 15], [x + 10, y - 15], [x + 18, y - 3]], "#bfdbfe", blue, 2)
    + rect(x - 21, y - 3, 42, 16, "#60a5fa", blue, 2)
    + circle(x - 12, y + 13, 5, ink, ink, 1) + circle(x + 12, y + 13, 5, ink, ink, 1);
}
function triangleMarker(column, row, fill) {
  const [x, y] = cellCenter(column, row);
  return polygon([[x, y - 17], [x + 18, y + 15], [x - 18, y + 15]], fill, violet, 2);
}
function reflectionGrid(horizontal = false) {
  let result = "";
  for (let x = 160; x <= 560; x += 40) result += line(x, 60, x, 380, "#cbd5e1", 1);
  for (let y = 60; y <= 380; y += 40) result += line(160, y, 560, y, "#cbd5e1", 1);
  return result + (horizontal ? line(160, 220, 560, 220, red, 3, true) : line(360, 40, 360, 400, red, 3, true));
}

// The correct text is kept separately from the distractors so shuffling cannot detach the key.
const questions = [];
function add(pages, question, correct, distractors, drawing) {
  assert.equal(distractors.length, 3);
  assert.equal(new Set([correct, ...distractors]).size, 4);
  questions.push({ pages, question, correct, distractors, drawing });
}

// Отсечка, pp. 47–49: naming, membership, ruler measurements and lines.
add([47], "Како се вика прикажаниот дел од права линија, ограничен со крајните точки A и B?", "Отсечка AB.", ["Права без крајни точки.", "Крива отворена линија.", "Крива затворена линија."], segment(150, 235, 565, 235, "A", "B"));
add([48], "Која од означените точки НЕ припаѓа на отсечката AB?", "Точката E.", ["Точката A.", "Точката C.", "Точката D."], segment(120, 265, 610, 265, "A", "B") + point(275, 265, "C") + point(440, 265, "D") + point(365, 130, "E", 0, -25, red));
add([49], "Прочитај на линијарот: колку е долга отсечката AB?", "6 cm", ["5 cm", "7 cm", "10 cm"], ruler(0, 6, "A", "B"));
add([49], "Отсечката MN почнува кај 2 cm, а завршува кај 7 cm на линијарот. Колку е нејзината должина?", "5 cm", ["2 cm", "7 cm", "9 cm"], ruler(2, 7, "M", "N"));
add([49], "Која од трите прикажани отсечки е најдолга?", "Отсечката CD.", ["Отсечката AB.", "Отсечката EF.", "Сите три имаат еднаква должина."], segment(130, 115, 370, 115, "A", "B") + text(430, 115, "4 cm", 24) + segment(130, 225, 550, 225, "C", "D", teal) + text(610, 225, "7 cm", 24) + segment(130, 335, 310, 335, "E", "F", violet) + text(370, 335, "3 cm", 24));
add([47, 48], "Кои се крајните точки на прикажаната отсечка?", "M и N.", ["M и P.", "P и N.", "Само P."], segment(160, 255, 570, 255, "M", "N") + point(350, 255, "P"));
add([48, 49], "Точките A, B и C лежат на иста отсечка. Колку различни отсечки се определени со парови од овие три точки?", "3", ["2", "4", "6"], segment(145, 240, 580, 240, "A", "C") + point(335, 240, "B"));
add([47], "Кој цртеж прикажува крива затворена линија?", "Цртеж 3.", ["Цртеж 1.", "Цртеж 2.", "Цртеж 4."], line(105, 130, 295, 130) + path("M 115 120 L 105 130 L 115 140 M 285 120 L 295 130 L 285 140") + text(200, 180, "1") + path("M 425 130 C 455 75 485 185 515 130 S 565 95 600 130", "none", teal) + text(510, 180, "2") + circle(200, 295, 58, "none", violet) + text(200, 380, "3") + segment(435, 305, 600, 305, "M", "N") + text(515, 380, "4"));

// 2Д-форми, pp. 50–57: polygons, vertices, sides, right angles and composition.
add([50], "Како се вика многуаголникот на сликата?", "Петаголник.", ["Четириаголник.", "Шестаголник.", "Седумаголник."], polygon([[220, 110], [480, 105], [570, 250], [360, 365], [160, 250]], "#ccfbf1"));
add([52, 57], "Колку темиња има прикажаниот седумаголник?", "7", ["6", "8", "9"], shape(7, "#ede9fe"));
add([50, 53], "Колку страни има прикажаниот осумаголник?", "8", ["6", "7", "9"], shape(8, "#fef3c7", 145, Math.PI / 8));
add([52, 57], "Колку агли има прикажаниот деветаголник?", "9", ["7", "8", "10"], shape(9, "#ffe4e6"));
add([50, 52], "Прикажаниот десетаголник има 10 страни. Колку темиња има?", "10", ["8", "9", "11"], shape(10, "#e0f2fe", 150));
add([52], "Која од наведените отсечки НЕ е страна на прикажаниот четириаголник ABCD?", "AC.", ["AB.", "BC.", "CD."], polygon([[190, 325], [545, 325], [495, 120], [245, 100]], "#f0fdfa") + line(190, 325, 495, 120, red, 3, true) + point(190, 325, "A", -24, 15) + point(545, 325, "B", 24, 15) + point(495, 120, "C", 22, -16) + point(245, 100, "D", -22, -16));
add([50], "Кој цртеж прикажува многуаголник, односно затворена форма составена само од отсечки?", "Цртеж 3.", ["Цртеж 1.", "Цртеж 2.", "Цртеж 4."], circle(200, 125, 54, "#fef3c7") + text(200, 210, "1") + path("M 425 160 L 455 85 L 515 165 L 590 95", "none", teal) + text(510, 210, "2") + polygon([[145, 365], [250, 365], [175, 260]], "#dbeafe") + text(200, 405, "3") + `<ellipse cx="510" cy="315" rx="85" ry="46" fill="#ede9fe" stroke="${ink}" stroke-width="4"/>` + text(510, 405, "4"));
add([55], "Кај кое теме на прикажаниот триаголник има прав агол?", "Кај темето A.", ["Кај темето B.", "Кај темето C.", "Кај сите три темиња."], polygon([[220, 330], [540, 330], [220, 100]], "#e0f2fe") + point(220, 330, "A", -24, 18) + point(540, 330, "B", 24, 18) + point(220, 100, "C", -24, -16));
add([55, 56], "Колку прави агли има прикажаниот правоаголник?", "4", ["1", "2", "3"], rect(170, 125, 380, 200, "#fef3c7"));
add([55], "На кој часовник стрелките формираат прав агол?", "На часовникот 1.", ["На часовникот 2.", "На часовникот 3.", "На часовникот 4."], clock(185, 115, 3, "1") + clock(525, 115, 6, "2") + clock(185, 320, 12, "3") + clock(525, 320, 5, "4"));
add([54, 57], "На колку мали триаголници е поделен прикажаниот шестаголник?", "6", ["4", "5", "8"], regular(6, 360, 225, 150, 0).map((p, i, vertices) => polygon([[360, 225], p, vertices[(i + 1) % 6]], i % 2 ? "#dbeafe" : "#ccfbf1", ink, 3)).join(""));
add([54], "Колку вкупно квадрати има на цртежот? Изброј ги и малите и големиот квадрат.", "5", ["4", "6", "8"], rect(220, 75, 280, 280, "#ede9fe") + line(360, 75, 360, 355) + line(220, 215, 500, 215));

// 3Д-форми, pp. 58–65: recognition, faces, vertices, edges, nets and views.
add([58], "Која 3Д-форма е прикажана на сликата?", "Конус.", ["Цилиндар.", "Пирамида.", "Коцка."], path("M 245 320 L 360 90 L 475 320 A 115 35 0 0 1 245 320 Z", "#fef3c7") + path("M 245 320 A 115 35 0 0 1 475 320", "none", "#64748b", 2, true));
add([58, 59], "На која 3Д-форма личи прикажаната конзерва?", "На цилиндар.", ["На конус.", "На топка.", "На коцка."], cylinder(360, 110, 320, 110, 34, true));
add([58, 59], "Која 3Д-форма ја препознаваш кај прикажаното топче?", "Топка.", ["Коцка.", "Квадар.", "Конус."], circle(360, 225, 140, "url(#ball)") + path("M 260 128 C 375 165 375 285 260 322", "none", blue, 3) + path("M 464 131 C 350 168 350 282 464 319", "none", blue, 3));
add([58, 59], "Како се вика прикажаната 3Д-форма со облик на издолжена кутија?", "Квадар.", ["Коцка.", "Цилиндар.", "Пирамида."], cuboid(160, 170, 330, 150, 75, 65));
add([60], "Колку вкупно ѕида има коцката, вклучувајќи ги и оние што не се гледаат?", "6", ["3", "4", "8"], cuboid());
add([60, 63], "Колку вкупно темиња има коцката, вклучувајќи ги и оние што не се гледаат?", "8", ["4", "6", "12"], cuboid(230, 140, 185, 185, 65, 60, "#ede9fe") + [[230, 140], [415, 140], [230, 325], [415, 325], [295, 80], [480, 80], [480, 265]].map(([x, y]) => circle(x, y, 6, violet, violet, 1)).join(""));
add([62, 63], "Колку вкупно рабови има квадарот?", "12", ["6", "8", "10"], cuboid(160, 180, 330, 135, 75, 75, "#ccfbf1"));
add([60], "Како се вика црвено означената отсечка, заедничка за два соседни ѕида на коцката?", "Раб.", ["Теме.", "Ѕид.", "Целата коцка."], cuboid(225, 145, 205, 205, 70, 65, "#f1f5f9") + line(225, 350, 430, 350, red, 9));
add([60, 62], "Како се вика сината рамна површина означена на квадарот?", "Ѕид.", ["Раб.", "Теме.", "Отсечка."], cuboid(165, 180, 320, 145, 70, 75, "#60a5fa"));
add([60, 62, 63], "Кое својство го имаат и коцката и прикажаниот издолжен квадар?", "И двете форми имаат по 6 ѕида.", ["Кај двете форми сите ѕидови се квадрати.", "Кај двете форми сите рабови се еднакво долги.", "И двете форми имаат по 4 темиња."], cuboid(80, 175, 150, 150, 45, 45) + cuboid(375, 205, 210, 110, 45, 65, "#ccfbf1"));
add([60, 64, 65], "Која 3Д-форма може да се состави со превиткување на прикажаната мрежа од шест еднакви квадрати?", "Коцка.", ["Цилиндар.", "Топка.", "Триаголна пирамида."], [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [1, 3]].map(([c, r]) => rect(245 + c * 75, 55 + r * 75, 75, 75, "#dbeafe", ink, 3)).join(""));
add([65], "Од кои 2Д-форми е составена прикажаната мрежа на триаголна пирамида?", "Од четири триаголници.", ["Од три триаголници и еден квадрат.", "Од шест квадрати.", "Од два круга и еден правоаголник."], polygon([[360, 140], [290, 261], [430, 261]], "#fef3c7") + polygon([[360, 140], [290, 261], [220, 140]], "#ffedd5") + polygon([[360, 140], [430, 261], [500, 140]], "#ffedd5") + polygon([[290, 261], [430, 261], [360, 382]], "#ffedd5"));
add([59], "Каква 2Д-форма имаат двете рамни основи на прикажаниот цилиндар?", "Кругови.", ["Квадрати.", "Триаголници.", "Петаголници."], cylinder(360, 115, 320, 125, 42));
add([61, 64], "Трите коцки се наредени во еден ред, без редење една врз друга. Што ќе видиш ако ги погледнеш одгоре?", "Три квадрати во еден ред.", ["Два квадрата во еден ред.", "Четири квадрати во еден ред.", "Еден триаголник."], cuboid(110, 180, 150, 150, 35, 35, "#fecaca") + cuboid(260, 180, 150, 150, 35, 35, "#bfdbfe") + cuboid(410, 180, 150, 150, 35, 35, "#bbf7d0") + text(360, 75, "Поглед одгоре", 25) + line(360, 100, 360, 140, violet, 3) + path("M 350 128 L 360 140 L 370 128", "none", violet, 3));

// Симетрија, pp. 66–69 and 76: counting axes, selecting an axis and reflecting.
add([66, 76], "Колку линии на симетрија има прикажаниот правоаголник што не е квадрат?", "2", ["1", "3", "4"], rect(145, 130, 430, 180, "#ccfbf1"));
add([66, 76], "Колку линии на симетрија има прикажаниот квадрат?", "4", ["1", "2", "3"], rect(225, 85, 270, 270, "#fef3c7"));
add([66, 76], "Колку линии на симетрија има прикажаниот триаголник, чии две коси страни се еднакво долги?", "1", ["0", "2", "3"], polygon([[200, 345], [520, 345], [360, 105]], "#ede9fe") + line(273, 218, 287, 228, violet, 3) + line(433, 232, 447, 218, violet, 3));
add([66, 76], "Трите страни на прикажаниот триаголник се со различни должини. Колку линии на симетрија има?", "0", ["1", "2", "3"], polygon([[200, 330], [540, 330], [270, 100]], "#ffe4e6"));
add([66], "На кој цртеж испрекинатата линија е линија на симетрија на правоаголникот?", "На цртежот 1.", ["На цртежот 2.", "На цртежот 3.", "На цртежот 4."], rect(95, 70, 190, 100, "#e0f2fe") + line(190, 45, 190, 195, red, 3, true) + text(190, 220, "1") + rect(435, 70, 190, 100, "#e0f2fe") + line(420, 180, 640, 60, red, 3, true) + text(530, 220, "2") + rect(95, 285, 190, 100, "#e0f2fe") + line(145, 260, 145, 405, red, 3, true) + text(190, 422, "3") + rect(435, 285, 190, 100, "#e0f2fe") + line(415, 315, 645, 315, red, 3, true) + text(530, 422, "4"));
add([68, 69], "Точката M е две квадратчиња лево од црвената линија на симетрија. Која точка е нејзина симетрична точка оддесно?", "Точката B.", ["Точката A.", "Точката C.", "Точката D."], reflectionGrid() + point(280, 180, "M", -20, -20, violet) + point(400, 180, "A", 0, -22) + point(440, 180, "B", 0, -22) + point(480, 180, "C", 0, -22) + point(440, 260, "D", 0, -22));
add([68, 69], "Точката P е две квадратчиња над црвената линија на симетрија. Која точка е нејзина симетрична точка под линијата?", "Точката C.", ["Точката A.", "Точката B.", "Точката D."], reflectionGrid(true) + point(280, 140, "P", -22, -15, teal) + point(280, 260, "A", -23, 0) + point(320, 300, "B", 20, 0) + point(280, 300, "C", -23, 0) + point(280, 340, "D", -23, 0));
add([67], "Која од прикажаните букви има вертикална линија на симетрија?", "Буквата А.", ["Буквата Б.", "Буквата Г.", "Буквата Р."], path("M 75 280 L 120 150 L 165 280 M 92 232 L 148 232", "none", blue, 9) + path("M 315 150 L 245 150 L 245 280 L 285 280 C 335 280 335 210 285 210 L 245 210", "none", teal, 9) + path("M 485 150 L 415 150 L 415 280", "none", violet, 9) + path("M 575 280 L 575 150 L 610 150 C 665 150 665 220 610 220 L 575 220", "none", amber, 9));

// Положба, насока и движење, pp. 70–75 and 77.
// Every grid states the reading order; rows increase downwards as drawn.
add([70, 72, 73], "На кое поле е ѕвездата? Запиши прво колона, па редица.", "Д-2", ["Б-5", "Д-3", "Г-2"], grid() + star(5, 2));
add([71], "Каде се наоѓа портокаловото крукче? Првиот број е колоната, а вториот е редицата.", "(2, 5)", ["(5, 2)", "(2, 4)", "(3, 5)"], grid(true) + marker(2, 5, amber));
add([73, 74], "Кој објект се наоѓа на полето Б-4? Прво се чита колоната, па редицата.", "Дрво.", ["Куќа.", "Топка.", "Автомобил."], grid() + tree(2, 4) + house(5, 2) + marker(1, 5, red) + car(4, 6));
add([72, 74, 75], "Кружето е на полето Б-3. На кое поле ќе стигне ако се помести две квадратчиња надесно? Прво се чита колоната, па редицата.", "Г-3", ["В-3", "Д-3", "Б-5"], grid() + marker(2, 3, blue) + text(360, 410, "→  →", 31, blue));
add([74, 75], "Кружето е на полето Д-5. На кое поле ќе стигне ако се помести две квадратчиња нагоре? Прво се чита колоната, па редицата.", "Д-3", ["Д-2", "Д-6", "Б-5"], grid() + marker(5, 5, teal) + text(360, 410, "↑  ↑", 31, teal));
add([72, 74, 75], "Од полето А-5 кружето се движи три квадратчиња надесно, па две нагоре. На кое поле ќе застане? Прво се чита колоната, па редицата.", "Г-3", ["В-3", "Г-2", "Д-3"], grid() + marker(1, 5, violet) + text(360, 410, "→  →  →    ↑  ↑", 29, violet));
add([74, 75], "Како треба да се движи триаголникот од полето В-2 за да стигне до обоениот триаголник на полето В-5? Прво се чита колоната, па редицата.", "Три квадратчиња надолу.", ["Три квадратчиња нагоре.", "Три квадратчиња надесно.", "Две квадратчиња надолу."], grid() + triangleMarker(3, 2, "white") + triangleMarker(3, 5, "#fbbf24"));
add([72, 75], "Кој пат го носи кружето од полето Б-5 до куќата на полето Д-2? Прво се чита колоната, па редицата.", "Три квадратчиња надесно, па три нагоре.", ["Три квадратчиња налево, па три нагоре.", "Две квадратчиња надесно, па три нагоре.", "Три квадратчиња надесно, па две нагоре."], grid() + marker(2, 5, violet) + house(5, 2));

assert.equal(questions.length, 50);
assert.equal(new Set(questions.map(q => q.question)).size, 50);
assert.equal(new Set(questions.map(q => q.drawing)).size, 50);
assert(questions.every(q => q.pages.every(p => p >= 47 && p <= 77)));

// Seeded Fisher–Yates shuffles make regeneration reproducible without a repeating key pattern.
let seed = 34778;
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}
function shuffle(values) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
const optionKeys = ["OptionA", "OptionB", "OptionC", "OptionD"];
// Exact equality is impossible for 50 questions: the closest distribution is 13/13/12/12.
const positions = shuffle(optionKeys.flatMap((key, i) => Array(i < 2 ? 13 : 12).fill(key)));

let browser;
try {
  browser = await chromium.launch({ headless: true });
} catch (error) {
  if (!error.message.includes("Executable doesn't exist")) throw error;
  browser = await chromium.launch({ channel: "chrome", headless: true });
}
try {
  const page = await browser.newPage({ viewport: { width: 720, height: 440 }, deviceScaleFactor: 1 });
  const exported = [];
  for (const [index, q] of questions.entries()) {
    await page.setContent(`<html><body style="margin:0">${svg(q.drawing)}</body></html>`);
    await page.evaluate(() => document.fonts.ready);
    const png = await page.screenshot({ type: "png", animations: "disabled" });
    assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    assert.equal(png.readUInt32BE(16), 720);
    assert.equal(png.readUInt32BE(20), 440);
    const wrong = shuffle(q.distractors);
    const key = positions[index];
    const record = { Question: q.question };
    for (const option of optionKeys) record[option] = option === key ? q.correct : wrong.shift();
    record.CorrectAnswer = key;
    record.image = `data:image/png;base64,${png.toString("base64")}`;
    assert.equal(record[record.CorrectAnswer], q.correct);
    exported.push(record);
  }
  const uniqueImages = new Set(exported.map(q => createHash("sha256").update(Buffer.from(q.image.split(",")[1], "base64")).digest("hex")));
  assert.equal(uniqueImages.size, 50);
  const distribution = Object.fromEntries(optionKeys.map(key => [key, exported.filter(q => q.CorrectAnswer === key).length]));
  assert.deepEqual(Object.values(distribution), [13, 13, 12, 12]);
  await writeFile(output, JSON.stringify({ Questions: exported }, null, 2) + "\n", "utf8");

  // Local contact sheets support visual review without shipping extra assets to the app.
  await mkdir(previewDirectory, { recursive: true });
  const reviewPage = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  for (let start = 0; start < 50; start += 10) {
    const cards = exported.slice(start, start + 10).map((q, i) => `<article><h3>${start + i + 1}. ${escapeXml(q.Question)}</h3><img src="${q.image}"/><p>${escapeXml(q[q.CorrectAnswer])}</p></article>`).join("");
    await reviewPage.setContent(`<html><head><meta charset="utf-8"/><style>body{margin:16px;font-family:Arial;background:#eef2f6;display:grid;grid-template-columns:1fr 1fr;gap:16px}article{background:white;border:1px solid #cbd5e1;padding:12px;border-radius:8px}h3{font-size:17px;min-height:60px;margin:0}img{display:block;width:100%}p{font-size:17px;color:#166534;margin:8px 0}</style></head><body>${cards}</body></html>`);
    await reviewPage.screenshot({ path: fileURLToPath(new URL(`questions-${start + 1}-${start + 10}.png`, previewDirectory)), fullPage: true });
  }
  console.log(`Generated ${exported.length} questions and ${uniqueImages.size} unique 720×440 PNG images.`);
  console.log(`Correct answers: ${JSON.stringify(distribution)}`);
  console.log(`Quiz: ${fileURLToPath(output)}`);
  console.log(`Visual review: ${fileURLToPath(previewDirectory)}`);
} finally {
  await browser.close();
}
