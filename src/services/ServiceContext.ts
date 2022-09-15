import { IEnslaversService } from "./EnslaversService";
import { IGeoService } from "./GeoService";
import { ILocalizationService } from "./LocalizationService";

export class ServiceContext {
    constructor(
        public localizationService: ILocalizationService,
        public geoService: IGeoService,
        public enslaversService: IEnslaversService) {
    }
}