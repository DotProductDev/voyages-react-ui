import { MapLocation, parseMaybeFloat } from "../models/Common";
import { ILocalizationService } from "./LocalizationService";
import { MemoryCache } from "./MemoryCache";

export interface IGeoService {
    getLocation(id: number): Promise<MapLocation>;
}

const mapNamesLocalizationGroup = "map_loc"

export class GeoService implements IGeoService {
    _cache = new MemoryCache<MapLocation>(1800);

    constructor(private localizationService: ILocalizationService, private endpoint: URL) {
    }

    async getLocation(id: number) {
        const key = id.toString();
        let cached = this._cache.get(key);
        if (cached) {
            return cached;
        }
        // Cache miss, bulk fetch from the API endpoint.
        let fetched: MapLocation[] = [];
        try {
            const response = await fetch(this.endpoint);
            const data = await response.json() as any[];
            await this.localizationService.fetchGroup(mapNamesLocalizationGroup);
            fetched = data.map(
                entry =>
                    new MapLocation(
                        parseInt(entry.id),
                        this.localizationService.get(`${mapNamesLocalizationGroup}_${entry.id}`),
                        parseMaybeFloat(entry.lat),
                        parseMaybeFloat(entry.lng)
                    )
            );
        } catch { }
        for (const loc of fetched) {
            this._cache.set(loc.id.toString(), loc);
        }
        cached = this._cache.get(key);
        if (!cached) {
            throw new Error(`MapLocation with id=${id} was not found`);
        }
        return cached;
    }
}

export const maybeGetLocation = (geoService: IGeoService, id: number | null) => {
    if (id === null) {
        return Promise.resolve<MapLocation | null>(null);
    }
    return geoService.getLocation(id);
}