import React from "react";
import { AppServiceContext } from "../App";
import { LanguageCode, LocalizedString } from "../models/Common";

export const LanguageContext = React.createContext<LanguageCode>("en");

type LocalizedStringText = { text: LocalizedString };
type LocalizedStringKey = { strKey: string };

export const LocalizedText = (props: LocalizedStringText | LocalizedStringKey) =>
    (<AppServiceContext.Consumer>
        {(services) => (<LanguageContext.Consumer>
            {(lang) => {
                if (props.hasOwnProperty("text")) {
                    return (props as LocalizedStringText).text.get(lang)
                }
                if (props.hasOwnProperty("strKey")) {
                    return services.localizationService.get((props as LocalizedStringKey).strKey).get(lang);
                }
            }}
        </LanguageContext.Consumer>)
    }
    </AppServiceContext.Consumer>);