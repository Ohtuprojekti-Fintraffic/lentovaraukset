import React from 'react';

import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import Dropdown from '../Dropdown';

function LanguagePicker() {
  const { i18n } = useTranslation();

  console.log(i18n.languages);

  const handleSelect = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <div className="flex flex-row items-center">
      <Globe />
      <Dropdown
        placeholder="FI"
        selectedSection={i18n.language}
        sections={[...i18n.languages]}
        onChange={handleSelect}
      />

    </div>
  );
}

export default LanguagePicker;
