import { Droplets, Rocket, FlaskConical, Calculator, Globe, TreePine, Zap, BookOpen, LucideIcon, Earth, Volume, Volume2, Leaf, Bug, Microscope, Sprout, Wind, Hash, Compass, Plus, Ruler, BarChart3, Home, Flag } from "lucide-react";

export interface Category {
  id: string;
  label: string;
  description: string;
  file: string;
  icon: LucideIcon;
  color: string;
}

export interface Subject {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  categories: Category[];
}

export interface Grade {
  id: string;
  label: string;
  subjects: Subject[];
}

export const grades: Grade[] = [
  {
    id: "grade1",
    label: "Прво Одделение",
    subjects: [
      {
        id: "matematika-1",
        label: "Математика",
        icon: Calculator,
        color: "340 65% 50%",
        categories: [
          {
            id: "broevi-sobiranje-1",
            label: "Броеви и собирање",
            description: "Собирање и одземање до 20",
            file: `${import.meta.env.BASE_URL}data/matematika-1.json`,
            icon: Calculator,
            color: "340 65% 50%",
          },
        ],
      },
      {
        id: "prirodni-nauki-1",
        label: "Природни Науки",
        icon: Leaf,
        color: "120 65% 45%",
        categories: [
          {
            id: "priroda-okolina-1",
            label: "Природа и околина",
            description: "Животни, растенија, годишни времиња",
            file: `${import.meta.env.BASE_URL}data/priroda-1.json`,
            icon: Leaf,
            color: "120 65% 45%",
          },
        ],
      },
      {
        id: "opstestvo-1",
        label: "Општество",
        icon: Globe,
        color: "220 65% 55%",
        categories: [
          {
            id: "semejstvo-zaednica-1",
            label: "Семејство и заедница",
            description: "Дом, училиште, сообраќај, празници",
            file: `${import.meta.env.BASE_URL}data/opstestvo-1.json`,
            icon: Globe,
            color: "220 65% 55%",
          },
        ],
      },
    ],
  },
  {
    id: "grade2",
    label: "Второ Одделение",
    subjects: [
      {
        id: "matematika-2",
        label: "Математика",
        icon: Calculator,
        color: "340 65% 50%",
        categories: [
          {
            id: "mnozenje-delenje-2",
            label: "Множење и делење",
            description: "Множење, делење, собирање до 100",
            file: `${import.meta.env.BASE_URL}data/matematika-2.json`,
            icon: Calculator,
            color: "340 65% 50%",
          },
        ],
      },
      {
        id: "prirodni-nauki-2",
        label: "Природни Науки",
        icon: Microscope,
        color: "259 78% 51%",
        categories: [
          {
            id: "voda",
            label: "Вода и материја",
            description: "Агрегатни состојби, испарување, кружење на водата",
            file: `${import.meta.env.BASE_URL}data/sample.json`,
            icon: Droplets,
            color: "196 80% 50%",
          },
          {
            id: "zivotni-rastenija-2",
            label: "Животни и растенија",
            description: "Цицачи, влечуги, водоземци, делови на растенија",
            file: `${import.meta.env.BASE_URL}data/priroda-2.json`,
            icon: Bug,
            color: "48 85% 50%",
          },
        ],
      },
      {
        id: "opstestvo-2",
        label: "Општество",
        icon: Globe,
        color: "220 65% 55%",
        categories: [
          {
            id: "geografija-2",
            label: "Географија",
            description: "Македонија, континенти, реки, езера",
            file: `${import.meta.env.BASE_URL}data/opstestvo-2.json`,
            icon: Globe,
            color: "220 65% 55%",
          },
          {
            id: "vselena",
            label: "Вселена",
            description: "Планети, ѕвезди, Сончев систем",
            file: `${import.meta.env.BASE_URL}data/вселена.json`,
            icon: Rocket,
            color: "262 60% 55%",
          },
        ],
      },
    ],
  },
  {
    id: "grade3",
    label: "Трето Одделение",
    subjects: [
      {
        id: "matematika-3",
        label: "Математика",
        icon: Calculator,
        color: "340 65% 50%",
        categories: [
          {
            id: "aritmetika-3",
            label: "Аритметика",
            description: "Множење, делење, дропки, мерки",
            file: `${import.meta.env.BASE_URL}data/matematika-3.json`,
            icon: Calculator,
            color: "340 65% 50%",
          },
        ],
      },
      {
        id: "prirodni-nauki-3",
        label: "Природни Науки",
        icon: FlaskConical,
        color: "259 78% 51%",
        categories: [
          {
            id: "nauka-3",
            label: "Наука",
            description: "Биологија, хемија, физика, човечко тело",
            file: `${import.meta.env.BASE_URL}data/наука.json`,
            icon: FlaskConical,
            color: "259 78% 51%",
          },
          {
            id: "ekosistemi-3",
            label: "Екосистеми и енергија",
            description: "Хранливи ланци, енергија, вулкани, земјотреси",
            file: `${import.meta.env.BASE_URL}data/priroda-3.json`,
            icon: Sprout,
            color: "160 70% 45%",
          },
        ],
      },
      {
        id: "opstestvo-3",
        label: "Општество",
        icon: Globe,
        color: "220 65% 55%",
        categories: [
          {
            id: "istorija-3",
            label: "Историја и географија",
            description: "Македонска историја, устав, соседи",
            file: `${import.meta.env.BASE_URL}data/opstestvo-3.json`,
            icon: BookOpen,
            color: "220 65% 55%",
          },
        ],
      },
    ],
  },
  ,
  {
    id: "grade4",
    label: "Четврто Одделение",
    subjects: [
      {
        id: "matematika-4",
        label: "Математика",
        icon: Calculator,
        color: "340 65% 50%",
        categories: [
          {
            id: "broevi-i-broenje-4",
            label: "1. Броеви и броење",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/4-broevi_i_broenje.json`,
            icon: Hash,
            color: "340 65% 50%",
          },
          {
            id: "geometrija-4",
            label: "2. Геометрија",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/4-geometrija.json`,
            icon: Compass,
            color: "280 70% 50%",
          },
          {
            id: "operacii-broeci-4",
            label: "3. Операции со броеви I",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/4-operacii_so_broevi.json`,
            icon: Plus,
            color: "220 70% 50%",
          },
                    {
            id: "operacii-broeci-tekstualni-4",
            label: "3. Операции со броеви II",
            description: "Цела тема, текстуални задачи",
            file: `${import.meta.env.BASE_URL}data/4-operacii_so_broevi_tekstualni.json`,
            icon: Plus,
            color: "80 65% 50%",
          },
          {
            id: "operacii-broevi-dropki-4",
            label: "3. Операции со броеви III",
            description: "Дропки",
            file: `${import.meta.env.BASE_URL}data/4-operacii_so_broevi_dropki.json`,
            icon: Plus,
            color: "10 80% 30%",
          },
          {
            id: "operacii-broevi-dropki-4",
            label: "3. Операции со броеви IV",
            description: "Дропки, текстуални задачи",
            file: `${import.meta.env.BASE_URL}data/4-operacii_so_broevi_dropki_tekstualni.json`,
            icon: Plus,
            color: "150 90% 10%",
          },
          {
            id: "merenje-4",
            label: "4. Мерење",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/4-merenje.json`,
            icon: Ruler,
            color: "40 80% 50%",
          },
          {
            id: "merenje-tekstualni-4",
            label: "4. Мерење (текстуални задачи)",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/4-merenje_tekstualni.json`,
            icon: Ruler,
            color: "30 75% 50%",
          },
          {
            id: "rabota-podatoci-4",
            label: "5. Работа со податоци",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/4-rabota_so_podatoci.json`,
            icon: BarChart3,
            color: "260 60% 50%",
          },
        ],
      },
      {
        id: "prirodni-nauki-4",
        label: "Природни Науки",
        icon: FlaskConical,
        color: "259 78% 51%",
        categories: [
          {
            id: "karakteristiki-na-zemjata-4",
            label: "1. Физичко-географски карактеристики на Земјата",
            description: "",
            file: `${import.meta.env.BASE_URL}data/4-karakteristiki_na_zemjata.json`,
            icon: Earth,
            color: "30 80% 55%",
          },
          {
            id: "osobini-na-zivotnite-i-rastenijata-4",
            label: "2. Особини на животните и растенијата и нивната поделба",
            description: "",
            file: `${import.meta.env.BASE_URL}data/4-osobini_na_zivotni_i_rastenija.json`,
            icon: Bug,
            color: "48 85% 50%",
          },
          {
            id: "aggregatni-sostojbi-4",
            label: "3. Агрегатни состојби на материјата и промени на агрегатните состојби",
            description: "",
            file: `${import.meta.env.BASE_URL}data/4-agregatna_sostojba.json`,
            icon: FlaskConical,
            color: "259 78% 51%",
          },
          {
            id: "zvuk-4",
            label: "4. Звук",
            description: "",
            file: `${import.meta.env.BASE_URL}data/4-zvuk.json`,
            icon: Volume2,
            color: "190 80% 50%",
          },
          {
            id: "elektricitet-4",
            label: "5. Електрицитет и магнетизам",
            description: "",
            file: `${import.meta.env.BASE_URL}data/4-elektricitet_magnetizam.json`,
            icon: Zap,
            color: "45 95% 51%",
          },
        ],
      },
      {
        id: "opstestvo-4",
        label: "Историја и Општество",
        icon: Globe,
        color: "220 65% 55%",
        categories: [
          {
            id: "moeto-opkruzuvanje-4",
            label: "1. Моето опкружување",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/4-moeto_opkruzuvanje.json`,
            icon: Home,
            color: "30 85% 55%",
          },
          {
            id: "sredinate-vo-koja-ziveam-4",
            label: "2. Средината во која живеам",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/4-sredina_vo_koja_ziveam.json`,
            icon: TreePine,
            color: "120 65% 45%",
          },
          {
            id: "mojata-drzava-4",
            label: "3. Мојата држава",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/4-mojata_drzava.json`,
            icon: Flag,
            color: "0 75% 50%",
          },
        ],
      },
    ],
  },
];

export interface Textbook {
  id: string;
  label: string;
  url: string;
  color: string;
}

export const textbooksByGrade: Record<string, Textbook[]> = {
  grade1: [
    {
      id: "matematik-1",
      label: "Математика (Прво одделение)",
      url: "#",
      color: "340 65% 50%",
    },
    {
      id: "prirodni-1",
      label: "Природни Науки (Прво одделение)",
      url: "#",
      color: "120 65% 45%",
    },
    {
      id: "opstestvo-1",
      label: "Општество (Прво одделение)",
      url: "#",
      color: "220 65% 55%",
    },
  ],
  grade2: [
    {
      id: "matematik-2",
      label: "Математика (Второ одделение)",
      url: "#",
      color: "340 65% 50%",
    },
    {
      id: "prirodni-2",
      label: "Природни Науки (Второ одделение)",
      url: "#",
      color: "259 78% 51%",
    },
    {
      id: "opstestvo-2",
      label: "Општество (Второ одделение)",
      url: "#",
      color: "220 65% 55%",
    },
  ],
  grade3: [
    {
      id: "matematik-3",
      label: "Математика (Трето одделение)",
      url: "#",
      color: "340 65% 50%",
    },
    {
      id: "prirodni-3",
      label: "Природни Науки (Трето одделение)",
      url: "#",
      color: "259 78% 51%",
    },
    {
      id: "opstestvo-3",
      label: "Општество (Трето одделение)",
      url: "#",
      color: "220 65% 55%",
    },
  ],
  grade4: [
    {
      id: "matematik-4",
      label: "Математика",
      url: "./ucebnici/Matematika_4_mak_web.pdf",
      color: "340 65% 50%",
    },
    {
      id: "prirodni-4",
      label: "Природни Науки",
      url: "./ucebnici/Prirodni_nauki_4_mak.pdf",
      color: "240 70% 45%",
    },
    {
      id: "opstestvo-4",
      label: "Општество",
      url: "./ucebnici/Istorija_opstestvo_4_mak.pdf",
      color: "220 65% 55%",
    },
  ],
};
