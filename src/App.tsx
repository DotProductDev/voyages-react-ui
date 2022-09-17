import './App.css';
import React, { useEffect, useState } from 'react';
import EnslaverVoyageConnections from './components/EnslaverVoyageConnections';
import { EnslaverContribution, EnslaverContributionType } from './models/EnslaverContribution';
import { MockServiceContext } from './tests/Mocks'
import { ServiceContext } from './services/ServiceContext';
import { LanguageContext, LocalizedText } from './components/LocalizedText';
import { LanguageCode, LanguageCodes } from './models/Common';
import { Menubar } from 'primereact/menubar';
import { useL10n } from './services/LocalizationService';
import { MenuItem } from 'primereact/menuitem';

const myServices = MockServiceContext;
export const AppServiceContext = React.createContext<ServiceContext>(myServices);

function App() {
  const [contrib, setContrib] = useState<EnslaverContribution|null>(null);
  const [lang, setLang] = useState<LanguageCode>("en");
  useEffect(
    () => {
      MockServiceContext.enslaversService
        .createContribution(1, EnslaverContributionType.Edit)
        .then(c => setContrib(c));
    },
    []);
  const l10n = myServices.localizationService;
  const menu = useL10n<MenuItem[]>(
    l10n,
    translate => [{
      label: translate("ui_localization_language_menu_selection_header"),
      icon: 'pi pi-fw pi-globe',
      items: LanguageCodes
        .map(code => ({
          label: translate(`ui_localization_language_menu_item_${code}`),
          command: () => setLang(code)
        }))
    }],
    lang
  );
  return (
    <div className="App">
      <LanguageContext.Provider value={lang}>
        <AppServiceContext.Provider value={MockServiceContext}>
          <Menubar model={menu} />
          <span><LocalizedText strKey="ui_localization_enslaver_alias_tree_header"/></span>
          {
            contrib !== null && <EnslaverVoyageConnections contribution={contrib} onUpdate={setContrib} />
          }
        </AppServiceContext.Provider>
      </LanguageContext.Provider>
    </div>
  );
}

export default App;
