import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Link>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">За нас</h1>
              <p className="text-lg text-muted-foreground">
                EDU.IDA е интерактивна образовна платформа создана за да направи учењето позабавно и поефикасно.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Наша мисија</h2>
              <p className="text-foreground leading-relaxed">
                Нашата цел е да им помогнеме на учениците да учат преку интерактивни квизови. Со забавни и ангажирачки вежби, 
                ние веруваме дека учењето може да биде достапно и пријатно за сите.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Што нудиме</h2>
              <ul className="space-y-3 text-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Интерактивни квизови за различни предмети и нивоа на образование</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Детални резултати и анализа на успешност</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Образовни материјали и учебници</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Користувачко-пријатен интерфејс за лесна навигација</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Контакт</h2>
              <p className="text-foreground">
                Ако имате прашања или предлози, контактирајте нас на:{" "}
                <a href="mailto:contact@edu.ida.mk" className="text-primary hover:underline">
                  contact@edu.ida.mk
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
