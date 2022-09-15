import { CompositeDate, MapLocation } from "./Common";

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
        public principal_alias: string,
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
    constructor(
        public id: number,
        public personal_data: EnslaverPersonalData,
        public aliases: EnslaverAlias[]) {
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