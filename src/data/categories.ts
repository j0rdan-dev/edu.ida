import { Droplets, Rocket, FlaskConical, Calculator, Globe, TreePine, Zap, BookOpen, LucideIcon } from "lucide-react";

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
        icon: TreePine,
        color: "142 60% 45%",
        categories: [
          {
            id: "priroda-okolina-1",
            label: "Природа и околина",
            description: "Животни, растенија, годишни времиња",
            file: `${import.meta.env.BASE_URL}data/priroda-1.json`,
            icon: TreePine,
            color: "142 60% 45%",
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
        icon: FlaskConical,
        color: "24 80% 55%",
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
            icon: TreePine,
            color: "142 60% 45%",
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
        color: "24 80% 55%",
        categories: [
          {
            id: "nauka-3",
            label: "Наука",
            description: "Биологија, хемија, физика, човечко тело",
            file: `${import.meta.env.BASE_URL}data/наука.json`,
            icon: FlaskConical,
            color: "24 80% 55%",
          },
          {
            id: "ekosistemi-3",
            label: "Екосистеми и енергија",
            description: "Хранливи ланци, енергија, вулкани, земјотреси",
            file: `${import.meta.env.BASE_URL}data/priroda-3.json`,
            icon: Zap,
            color: "48 85% 50%",
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
];
