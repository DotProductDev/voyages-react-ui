import { LocalizedString } from "../models/Common"

export interface ILocalizationService {
    fetchLocalized(group: string) : Promise<[LocalizedString]>;
}