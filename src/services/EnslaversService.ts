import Immutable from "immutable";
import { parseCsvDate, makeDate } from "../models/Common";
import { VoyageSummaryInfo, EnslaverAlias, EnslaverIdentity, EnslaverPersonalData, EnslaverContribution, EnslaverContributionType } from "../models/EnslaverContribution";
import { IGeoService, maybeGetLocation } from "./GeoService";

export interface IEnslaversService {
    createContribution(enslaverId: number | null, type: EnslaverContributionType): Promise<EnslaverContribution>;

    saveContribution(contribution: EnslaverContribution): Promise<boolean>;
}

const ecTypeMap = Immutable.Map<string, EnslaverContributionType>({
    ["add" as string]: EnslaverContributionType.Add,
    ["edit" as string]: EnslaverContributionType.Edit,
    ["merge" as string]: EnslaverContributionType.Merge,
    ["split" as string]: EnslaverContributionType.Split,
});

export const parseEnslaverContribution = async (data: any, geoService: IGeoService) => {
    const parseVoyageInfo = (voyages: any[]) =>
        Promise.all(
            voyages.map(async v =>
                new VoyageSummaryInfo(
                    parseInt(v.voyage__voyage_id),
                    v.voyage__voyage_ship__ship_name,
                    parseCsvDate(v.voyage__voyage_dates__imp_arrival_at_port_of_dis),
                    await geoService.getLocation(v.voyage__voyage_itinerary__imp_principal_place_of_slave_purchase_id),
                    await geoService.getLocation(v.voyage__voyage_itinerary__imp_principal_port_slave_dis_id)
                )
            )
        );
    const parseAliases = (aliases: { [id: string]: any }) =>
        Promise.all(
            Object.entries(aliases).map(async ([_, alias]) =>
                new EnslaverAlias(
                    parseInt(alias.id),
                    alias.name,
                    await parseVoyageInfo(alias.voyages)
                )
            )
        );
    // Map the data to our entities.
    const parseIdentities = async (identities: { [id: string]: any }) =>
        Promise.all(
            Object.entries(identities).map(async ([key, { aliases, personal_data }]) =>
                new EnslaverIdentity(
                    parseInt(key),
                    new EnslaverPersonalData(
                        personal_data.principal_alias,
                        makeDate(personal_data.birth_year, personal_data.birth_month, personal_data.birth_day),
                        await maybeGetLocation(geoService, personal_data.birth_place_id),
                        makeDate(personal_data.death_year, personal_data.death_month, personal_data.death_day),
                        await maybeGetLocation(geoService, personal_data.death_place_id),
                        personal_data.father_name,
                        personal_data.father_occupation,
                        personal_data.mother_name,
                        personal_data.probate_date,
                        personal_data.will_value_pounds,
                        personal_data.will_value_dollars,
                        personal_data.will_court,
                        personal_data.notes,
                        await maybeGetLocation(geoService, personal_data.principal_location)
                    ),
                    await parseAliases(aliases)
                )
            )
        );
    try {
        const type = ecTypeMap.get(data.type, null);
        if (type === null) return null;
        return new EnslaverContribution(type, await parseIdentities(data.identities));
    } catch {
        return null;
    }
}

// TODO: create a concrete service that uses the backend API.