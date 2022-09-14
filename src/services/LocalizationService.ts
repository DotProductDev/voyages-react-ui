import { LanguageCode, LanguageCodes, LocalizedString } from "../models/Common"
import { MemoryCache } from "./MemoryCache";

export interface ILocalizationService {
    get(key: string): LocalizedString;

    fetchGroup(group: string): Promise<number>;
}

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
            let count = 0;
            for (const entry of data) {
                if (!entry) continue;
                const localizations = new Map<LanguageCode, string>();
                for (const lang of LanguageCodes) {
                    const val = entry[lang]
                    if (val && typeof(val) === "string") {
                        localizations.set(lang, val);
                    }
                }
                this._mem.set(entry.key, new LocalizedString(entry.key, localizations));
                ++count;
            }
            return count;
        } catch {
            return 0;
        }
    }
}