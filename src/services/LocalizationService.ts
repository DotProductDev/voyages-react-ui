import { useEffect, useState } from "react";
import { LanguageCode, LanguageCodes, LocalizedString } from "../models/Common"
import { MemoryCache } from "./MemoryCache";

export interface ILocalizationService {
    get(key: string): LocalizedString;

    fetchGroup(group: string): Promise<number>;
}

export function useL10n<T extends object>(
        service: ILocalizationService,
        fn: (translate: (key: string) => string) => T,
        lang: LanguageCode) {
    const [val, setVal] = useState<T>(null!);
    const [prevLang, setPrevLang] = useState<LanguageCode|null>(null);
    useEffect(
        () => {
            if (prevLang !== lang) {
                const translator = (key: string) => service.get(key).get(lang);
                setVal(fn(translator));
                setPrevLang(lang);
            }
        },
        [service, fn, lang, prevLang]
    );
    return val;
}

export const parseLocalization = (data: any) => {
    const result = new Map<string, LocalizedString>();
    const entries = Object.entries(data as {[key: string]: {[lang: string]: string}});
    for (const [key, values] of entries) {
        const localizations = new Map<LanguageCode, string>();
        for (const lang of LanguageCodes) {
            const val = values[lang]
            if (val && typeof(val) === "string") {
                localizations.set(lang, val);
            }
        }
        result.set(key, new LocalizedString(key, localizations));
    }
    return result;
};

export class LocalizationService implements ILocalizationService {
    _mem = new MemoryCache<LocalizedString>(24 * 3600);

    constructor(private endpoint: URL) {
    }

    get = (key: string) =>
        this._mem.get(key) ?? new LocalizedString(key, new Map<LanguageCode, string>());

    async fetchGroup(group: string) {
        const url = new URL(this.endpoint);
        url.searchParams.append("group", group);
        try {
            const response = await fetch(url);
            const data = await response.json() as any[];
            const items = parseLocalization(data);
            let count = 0;
            for (const [key, item] of Object.entries(items)) {
                this._mem.set(key, item);
                ++count;
            }
            return count;
        } catch {
            return 0;
        }
    }
}