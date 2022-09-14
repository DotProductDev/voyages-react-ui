export const LanguageCodes = ["en", "pt", "es"] as const;

export type LanguageCode = typeof LanguageCodes[number];

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

export class MapLocation {
    constructor(
        public id: number,
        public name: LocalizedString,
        public lat: number | null,
        public lng: number | null
    ) { }
}

export const parseMaybeInt = (val: string | number | null | undefined) => {
    if (typeof val === 'number') {
        return val;
    }
    if (val === null || val === undefined || val === "") {
        return null;
    }
    return parseInt(val);
}

export const parseMaybeFloat = (val: string | number | null | undefined) => {
    if (typeof val === 'number') {
        return val;
    }
    if (val === null || val === undefined || val === "") {
        return null;
    }
    return parseFloat(val);
}

export class CompositeDate {
    constructor(public year: number, public month: number | null, public day: number | null) {
    }
}

export const makeDate = (year: number | string | null, month: number | string | null, day: number | string | null) => {
    year = parseMaybeInt(year);
    if (year === null) {
        return null;
    }
    return new CompositeDate(year, parseMaybeInt(month), parseMaybeInt(day));
}

export const parseCsvDate = (csvDate: string) => {
    const [month, day, year] = csvDate.split(',');
    return new CompositeDate(parseInt(year), parseMaybeInt(month), parseMaybeInt(day));
}