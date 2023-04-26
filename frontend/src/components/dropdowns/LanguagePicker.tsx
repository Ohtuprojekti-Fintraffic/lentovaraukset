import React from 'react';

import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import Dropdown from '../Dropdown';

function LanguagePicker() {
  const { i18n } = useTranslation();

  const languages = {
    suomi: 'fi',
    english: 'en',
  };

  const handleSelect = (language: string) => {
    i18n.changeLanguage(languages[language as keyof typeof languages]);
    console.log(i18n.language);
  };

  return (
    <div className="flex flex-row items-center">
      <Dropdown
        placeholder="fi"
        selectedSection={i18n.language.toUpperCase()}
        sections={Object.keys(languages)}
        onChange={handleSelect}
        variant="tertiary"
        glyph={<Globe />}
      />
    </div>
  );
}

export default LanguagePicker;
