export type LanguageCode = "en" | "pt" | "es";

export class LocalizedString {
    constructor(
        public key: string,
        public localizations: Map<LanguageCode, string>
    ) { }

    get(lang: LanguageCode): string {
        let result = this.localizations.get(lang)
        if (!result && lang !== "en") {
            // Fallback to English.
            result = this.localizations.get("en")
        }
        return result ?? this.key;
    }
}

export class GeoLocation {
    constructor(
        public name: LocalizedString,
        public lat?: number,
        public lng?: number
    ) { }
}