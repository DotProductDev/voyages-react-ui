import Immutable from "immutable";
import { IGeoService, maybeGetLocation } from "../services/GeoService";
import { CompositeDate, MapLocation, makeDate, parseCsvDate } from "./Common";

export class VoyageSummaryInfo {
    constructor(
        public id: number,
        public ship_name: string,
        public date: CompositeDate,
        public embarkation: MapLocation,
        public disembarkation: MapLocation) {
    }
}

export class EnslaverAlias {
    constructor(public id: number, public alias: string, public voyages: VoyageSummaryInfo[]) {
    }
}

export class EnslaverPersonalData {
    constructor(
        public primary_alias: string,
        public birth: CompositeDate | null,
        public birth_place: MapLocation | null,
        public death: CompositeDate | null,
        public death_place: MapLocation | null,
        public father_name: string | null,
        public father_occupation: string | null,
        public mother_name: string | null,
        public probate_date: string | null,
        public will_value_pounds: string | null,
        public will_value_dollars: string | null,
        public will_court: string | null,
        public notes: string | null,
        public principal_location: MapLocation | null) {
    }
}

export class EnslaverIdentity {
    constructor(public id: number, public personal_data: EnslaverPersonalData, public aliases: EnslaverAlias[]) {
    }
}

export enum EnslaverContributionType {
    Add,
    Edit,
    Merge,
    Split
}

export class EnslaverContribution {
    constructor(public type: EnslaverContributionType, public identities: EnslaverIdentity[]) {
        const expected_len = type === EnslaverContributionType.Split ? 2 : 1;
        if (identities.length !== expected_len) {
            throw new Error(`Expected ${expected_len} identity(ies) in constructor.`);
        }
    }
}

const ecTypeMap = Immutable.Map<string, EnslaverContributionType>({
    ["add" as string]: EnslaverContributionType.Add,
    ["edit" as string]: EnslaverContributionType.Edit,
    ["merge" as string]: EnslaverContributionType.Merge,
    ["split" as string]: EnslaverContributionType.Split,
});

export const parseEnslaverContribution = async (json: string, geoService: IGeoService) => {
    const data = JSON.parse(json);
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
            Object.entries(aliases).map(async ([name, alias]) =>
                new EnslaverAlias(
                    parseInt(alias.id),
                    name,
                    await parseVoyageInfo(alias.voyages)
                )
            )
        );
    // Map the data to our entities.
    const parseIdentities = async (identities: { [id: string]: any }) =>
        Promise.all(
            Object.entries(identities).map(async ([key, identity]) =>
                new EnslaverIdentity(
                    parseInt(key),
                    new EnslaverPersonalData(
                        identity.primary_alias,
                        makeDate(identity.birth_year, identity.birth_month, identity.birth_day),
                        await maybeGetLocation(geoService, identity.birth_place),
                        makeDate(identity.death_year, identity.death_month, identity.death_day),
                        await maybeGetLocation(geoService, identity.death_place),
                        identity.father_name,
                        identity.father_occupation,
                        identity.mother_name,
                        identity.probate_date,
                        identity.will_value_pounds,
                        identity.will_value_dollars,
                        identity.will_court,
                        identity.notes,
                        await maybeGetLocation(geoService, identity.principal_location)
                    ),
                    await parseAliases(identity.aliases)
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