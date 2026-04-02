import { GameWithDetails } from "src/common/models/Game";
import Profile from "src/common/models/Profile";
import Sport from "src/common/models/Sport";

export interface GetProfileResponse extends Profile {
    favoriteSports: Sport[];
    last5Games: GameWithDetails[];
    totalGamesPlayed: number;
    totalGamesHosted: number;
    totalGamesJoined: number;
}

export interface EditProfileRequest {
    displayName?: string;
    bio?: string;
    profilePicture?: string;
}

export interface EditProfileResponse extends Profile { 
    favoriteSports: Sport[];
    last5Games: GameWithDetails[];
    totalGamesHosted: number;
    totalGamesJoined: number;
}