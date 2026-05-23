import { Droplets, Rocket, FlaskConical, Calculator, Globe, TreePine, Zap, BookOpen, LucideIcon, Earth, Volume, Volume2, Leaf, Bug, Microscope, Sprout, Wind, Hash, Compass, Plus, Ruler, BarChart3, Home, Flag, Clock } from "lucide-react";

export interface Category {
  id: string;
  label: string;
  description: string;
  file: string;
  timeLimitSeconds?: number;
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
        label: "Природни Науки (soon)",
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
            id: "broevi-i-broenje-3",
            label: "1. Броеви и броење",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/3-broevi_i_broenje.json`,
            icon: Hash,
            color: "340 65% 50%",
          },
          {
            id: "geometrija-3",
            label: "2. Геометрија",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/3-geometrija.json`,
            icon: Compass,
            color: "280 70% 50%",
          },
          {
            id: "operacii-so-broevi-3",
            label: "3. Операции со броеви",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/3-operacii_so_broevi.json`,
            icon: Plus,
            color: "220 70% 50%",
          },
          {
            id: "merenje-3",
            label: "4. Мерење",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/3-merenje.json`,
            icon: Ruler,
            color: "40 80% 50%",
          },
          {
            id: "merenje-dolzina-3",
            label: "4.1. Мерење должина",
            description: "Мерење должина - метар, сантиметар, милиметар",
            file: `${import.meta.env.BASE_URL}data/3-merenje_dolzina.json`,
            icon: Ruler,
            color: "30 75% 50%",
          },
          {
            id: "merenje-masa-3",
            label: "4.2. Мерење маса",
            description: "Мерење маса - килограм, грам",
            file: `${import.meta.env.BASE_URL}data/3-merenje_masa.json`,
            icon: Ruler,
            color: "20 70% 50%",
          },
          {
            id: "merenje-zafatnina-3",
            label: "4.3. Мерење зафатнина",
            description: "Мерење зафатнина - литар, милилитар",
            file: `${import.meta.env.BASE_URL}data/3-merenje_zafatnina.json`,
            icon: FlaskConical,
            color: "195 80% 50%",
          },
          {
            id: "merenje-vreme-3",
            label: "4.4. Мерење време",
            description: "Мерење време - часови, минути, секунди",
            file: `${import.meta.env.BASE_URL}data/3-merenje_vreme.json`,
            icon: Clock,
            color: "190 70% 50%",
          },
          {
            id: "rabota-so-podatoci-3",
            label: "5. Работа со податоци",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/3-rabota_so_podatoci.json`,
            icon: BarChart3,
            color: "260 60% 50%",
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
            id: "skelet-muskuli-vitalni-organi-3",
            label: "Скелет, мускули, витални органи",
            description: "Системи во човечкото тело и нивни функции",
            file: `${import.meta.env.BASE_URL}data/priroda-3-skelet_muskuli_organi.json`,
            icon: Microscope,
            color: "15 78% 47%",
          },
          {
            id: "unapreduvanje-zdravjeto-3",
            label: "Унапредување на здравјето",
            description: "Здрава исхрана, хигиена и секојдневни навики",
            file: `${import.meta.env.BASE_URL}data/priroda-3-unapreduvanje_zdravjeto.json`,
            icon: Leaf,
            color: "120 65% 45%",
          },
          {
            id: "sili-i-dvizenja-3",
            label: "Сили и движења",
            description: "Потисок, влечење, триење и брзина",
            file: `${import.meta.env.BASE_URL}data/priroda-3-sili_i_dvizenja.json`,
            icon: Wind,
            color: "200 80% 48%",
          },
          {
            id: "promeni-na-materijalite-3",
            label: "Промени на материјалите",
            description: "Промени на агрегатна состојба и својства",
            file: `${import.meta.env.BASE_URL}data/priroda-3-promeni_na_materijalite.json`,
            icon: Droplets,
            color: "195 75% 52%",
          },
          {
            id: "promeni-na-materijalite-definicii-3",
            timeLimitSeconds: 60,
            label: "Промени на материјалите (дефиниции)",
            description: "Дефиниции и поими за промени на материјалите",
            file: `${import.meta.env.BASE_URL}data/priroda-3-promeni_na_materijalite_definicii.json`,
            icon: Droplets,
            color: "195 60% 40%",
          },
          {
            id: "vselena-nebesni-tela-3",
            label: "Вселена и небесни тела",
            description: "Сончев систем, планети, ѕвезди и движење на Земјата",
            file: `${import.meta.env.BASE_URL}data/priroda-3-vselena_nebesni_tela.json`,
            icon: Rocket,
            color: "262 60% 55%",
          },
          {
            id: "nauka-3",
            label: "БОНУС: Наука",
            description: "Биологија, хемија, физика, човечко тело",
            file: `${import.meta.env.BASE_URL}data/наука.json`,
            icon: FlaskConical,
            color: "259 78% 51%",
          },
          {
            id: "ekosistemi-3",
            label: "БОНУС: Екосистеми и енергија",
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
            id: "operacii-broevi-dropki-4-tekstualni",
            timeLimitSeconds: 150,
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
        id: "makedonski-jazik-4",
        label: "Македонски јазик",
        icon: BookOpen,
        color: "14 80% 45%",
        categories: [
          {
            id: "isto-sprotivno-znacenje-4",
            label: "Зборови со исто и зборови со спротивно значење",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/4-isto_i_sprotivno_znacenje.json`,
            icon: BookOpen,
            color: "6 82% 44%",
          },
          {
            id: "glasovi-bukvi-zbor-slogovi-4",
            label: "Гласови, букви, збор, поделба на зборот на слогови",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/4-glasovi_bukvi_zbor_slogovi.json`,
            icon: BookOpen,
            color: "10 80% 42%",
          },
          {
            id: "glagoli-4",
            label: "Глаголи",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/4-glagoli.json`,
            icon: BookOpen,
            color: "14 80% 45%",
          },
          {
            id: "recenici-struktura-4",
            label: "Реченици и структура на реченица",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/4-recenici_i_struktura.json`,
            icon: BookOpen,
            color: "22 78% 45%",
          },
          {
            id: "imenki-4",
            label: "Именки",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/4-imenki.json`,
            icon: BookOpen,
            color: "30 72% 44%",
          },
          {
            id: "pridavki-4",
            label: "Придавки",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/4-pridavki.json`,
            icon: BookOpen,
            color: "38 70% 42%",
          },
          {
            id: "licni-zamenki-4",
            label: "Лични заменки",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/4-licni_zamenki.json`,
            icon: BookOpen,
            color: "46 68% 40%",
          },
          {
            id: "struktura-imenki-zamenki-glagoli-pridavki-4",
            label: "Структура на реченица, именки, лични заменки, глаголи и придавки",
            description: "Повеќе теми",
            file: `${import.meta.env.BASE_URL}data/4-struktura_imenki_zamenki_glagoli_pridavki.json`,
            icon: BookOpen,
            color: "60 80% 40%",
          },
          {
            id: "interpunkciski-znaci-4",
            label: "Интерпункциски знаци",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/4-interpunkciski_znaci.json`,
            icon: BookOpen,
            color: "54 66% 38%",
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
            file: `${import.meta.env.BASE_URL}data/4-sredinata_vo_koja_ziveam.json`,
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
                    {
            id: "mojata-drzava-4-do-142",
            label: "3. Мојата држава",
            description: "Заклучно со 142 страна",
            file: `${import.meta.env.BASE_URL}data/4-mojata_drzava-up-to-142.json`,
            icon: Flag,
            color: "20 55% 15%",
          },
        ],
      },
    ],
  },
  {
    id: "grade5",
    label: "Петто Одделение [во изработка]",
    subjects: [
      {
        id: "matematika-5",
        label: "Математика",
        icon: Calculator,
        color: "340 65% 50%",
        categories: [
          {
            id: "broevi-i-broenje-5",
            label: "1. Броеви и броење",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/5-broevi_i_broenje.json`,
            icon: Hash,
            color: "340 65% 50%",
          },
          {
            id: "geometrija-5",
            label: "2. Геометрија",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/5-geometrija.json`,
            icon: Compass,
            color: "280 70% 50%",
          },
          {
            id: "operacii-so-broevi-5",
            label: "3. Операции со броеви",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/5-operacii_so_broevi.json`,
            icon: Plus,
            color: "220 70% 50%",
          },
          {
            id: "merenje-5",
            label: "4. Мерење",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/5-merenje.json`,
            icon: Ruler,
            color: "40 80% 50%",
          },
          {
            id: "rabota-so-podatoci-5",
            label: "5. Работа со податоци",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/5-rabota_so_podatoci.json`,
            icon: BarChart3,
            color: "260 60% 50%",
          },
        ],
      },
      {
        id: "prirodni-nauki-5",
        label: "Природни Науки",
        icon: FlaskConical,
        color: "259 78% 51%",
        categories: [
          {
            id: "prirodni-nauki-5",
            label: "Природни науки",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/sample.json`,
            icon: FlaskConical,
            color: "259 78% 51%",
          },
        ],
      },
      {
        id: "makedonski-jazik-5",
        label: "Македонски јазик",
        icon: BookOpen,
        color: "14 80% 45%",
        categories: [
          {
            id: "makedonski-jazik-5",
            label: "Македонски јазик",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/sample.json`,
            icon: BookOpen,
            color: "14 80% 45%",
          },
        ],
      },
      {
        id: "istorija-opstestvo-5",
        label: "Историја и Општество",
        icon: Globe,
        color: "220 65% 55%",
        categories: [
          {
            id: "istorija-opstestvo-5",
            label: "Историја и Општество",
            description: "Цела тема",
            file: `${import.meta.env.BASE_URL}data/sample.json`,
            icon: Globe,
            color: "220 65% 55%",
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
      id: "makedonski-3",
      label: "Македонски Јазик",
      url: `${import.meta.env.BASE_URL}ucebnici/makedonski_3.pdf`,
      color: "340 65% 50%",
    },
        {
      id: "matematika-3",
      label: "Математика",
      url: `${import.meta.env.BASE_URL}ucebnici/matematika_3.pdf`,
      color: "340 25% 50%",
    },
    {
      id: "prirodni-3",
      label: "Природни Науки",
      url: `${import.meta.env.BASE_URL}ucebnici/prirodni_3.pdf`,
      color: "259 78% 51%",
    },
    {
      id: "opstestvo-3",
      label: "Општество",
      url: `${import.meta.env.BASE_URL}ucebnici/Opstestvo_3.pdf`,
      color: "220 65% 55%",
    },
  ],
  grade4: [
    {
      id: "matematik-4",
      label: "Математика",
      url: `${import.meta.env.BASE_URL}ucebnici/Matematika_4_mak_web.pdf`,
      color: "340 65% 50%",
    },
    {
      id: "prirodni-4",
      label: "Природни Науки",
      url: `${import.meta.env.BASE_URL}ucebnici/Prirodni_nauki_4_mak.pdf`,
      color: "240 70% 45%",
    },
    {
      id: "opstestvo-4",
      label: "Историја и Општество",
      url: `${import.meta.env.BASE_URL}ucebnici/Istorija_opstestvo_4_mak.pdf`,
      color: "220 65% 55%",
    },
        {
      id: "makedonski-4",
      label: "Македонски Јазик",
      url: `${import.meta.env.BASE_URL}ucebnici/makedonski_4.pdf`,
      color: "400 85% 35%",
    },
  ],
  grade5: [
    {
      id: "matematik-5",
      label: "Математика",
      url: "#",
      color: "340 65% 50%",
    },
    {
      id: "prirodni-5",
      label: "Природни Науки",
      url: "#",
      color: "259 78% 51%",
    },
    {
      id: "makedonski-5",
      label: "Македонски Јазик",
      url: "#",
      color: "14 80% 45%",
    },
    {
      id: "istorija-opstestvo-5",
      label: "Историја и Општество",
      url: "#",
      color: "220 65% 55%",
    },
  ],
};
