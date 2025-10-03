import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'uk' ? 'en' : 'uk';
    i18n.changeLanguage(newLang);
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={toggleLanguage}
      data-testid="button-language-toggle"
      className="toggle-elevate font-semibold"
      data-state={i18n.language === 'en' ? "on" : "off"}
    >
      {i18n.language === 'uk' ? 'EN' : 'UA'}
    </Button>
  );
}
