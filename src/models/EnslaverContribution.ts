import { GeoLocation } from "./Common";

export class VoyageSummaryInfo {
    constructor(public id: number, public ship_name: string, public year: number) {
    }
}

export class EnslaverAlias {
    constructor(public id: number, public alias: string, public voyages: VoyageSummaryInfo[]) {
    }
}

export class EnslaverPersonalData {
    constructor(
        public primary_alias: string,
        public birth_year?: number,
        public birth_month?: number,
        public birth_day?: number,
        public birth_place?: GeoLocation,
        public death_year?: number,
        public death_month?: number,
        public death_day?: number,
        public death_place?: GeoLocation,
        public father_name?: string,
        public father_occupation?: string,
        public mother_name?: string,
        public probate_date?: string,
        public will_value_pounds?: string,
        public will_value_dollars?: string,
        public will_court?: string,
        public notes?: string,
        public principal_location?: GeoLocation,
    ) { }
}

export class EnslaverIdentity {
    constructor(public id: number, public personal_data: EnslaverPersonalData, public aliases: [EnslaverAlias]) {
    }
}

export enum EnslaverContributionType {
    Add,
    Edit,
    Merge,
    Split
}

export class EnslaverContribution {
    constructor(public type: EnslaverContributionType, public identities: [EnslaverIdentity]) {
        const expected_len = type === EnslaverContributionType.Split ? 2 : 1;
        if (identities.length != expected_len) {
            throw new Error(`Expected ${expected_len} identity(ies) in constructor.`);
        }
    }
}

export const parseEnslaverContribution = async (json: string) => {
    const data = JSON.parse(json);
    // Map the data to our entities.
    
}