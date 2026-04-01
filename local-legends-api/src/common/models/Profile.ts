import Sport from "./Sport";
import { GameWithDetails } from "./Game";

export default class Profile {
    id: string;
    displayName: string;
    bio?: string;
    status: ProfileStatus;
    profileImageUrl?: string;
    reliabilityScore?: number;
    yearJoined: number;

    constructor(id: string, displayName: string, status: ProfileStatus, profileImageUrl?: string, yearJoined: number = new Date().getFullYear(), bio?: string, reliabilityScore?: number) {
        this.id = id;
        this.displayName = displayName;
        this.status = status;
        this.yearJoined = yearJoined;
        this.profileImageUrl = profileImageUrl;
        this.bio = bio;
        this.reliabilityScore = reliabilityScore;
    }
}

export enum ProfileStatus {
    Banned = 'banned',
    GoodStanding = 'good_standing'
}

export type ProfileInfo = {
    profile: Profile;
    gamesCreated: number;
    gamesJoined: number;
    favoriteSports: Sport[];
    mostRecentGames: GameWithDetails[];
    currentUserIsFollowing?: boolean;
}