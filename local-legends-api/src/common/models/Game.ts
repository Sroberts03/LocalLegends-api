import Profile from "./Profile";

export default class Game {
    id: number;
    sportId: number;
    creatorId: string;
    locationId: number;
    name: string;
    description: string;
    maxPlayers: number;
    minPlayers: number;
    status: GameStatus;
    startTime: Date;
    endTime: Date;
    isRecurring: boolean;
    skillLevel: SkillLevel;
    genderPreference: GenderPreference;
    currentPlayerCount: number;
    accessType: AccessType;
    createdAt: Date;
    updatedAt: Date;

    constructor(
        id: number, 
        sportId: number, 
        creatorId: string, 
        locationId: number, 
        name: string, 
        description: string, 
        maxPlayers: number, 
        minPlayers: number, 
        status: GameStatus, 
        startTime: Date, 
        endTime: Date, 
        isRecurring: boolean, 
        skillLevel: SkillLevel, 
        genderPreference: GenderPreference, 
        currentPlayerCount: number,
        accessType: AccessType,
        createdAt: Date,
        updatedAt: Date
    ) {
        this.id = id;
        this.sportId = sportId;
        this.creatorId = creatorId;
        this.locationId = locationId;
        this.name = name;
        this.description = description;
        this.maxPlayers = maxPlayers;
        this.minPlayers = minPlayers;
        this.status = status;
        this.startTime = startTime;
        this.endTime = endTime;
        this.isRecurring = isRecurring;
        this.skillLevel = skillLevel;
        this.genderPreference = genderPreference;
        this.currentPlayerCount = currentPlayerCount;
        this.accessType = accessType;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export class GameCreation {
    id?: number;
    sportId?: number;
    googlePlaceId?: string;
    gameName?: string;
    gameDescription?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    locationName?: string;
    locationDescription?: string;
    maxPlayers?: number;
    minPlayers?: number;
    startTime?: Date;
    endTime?: Date;
    status: GameStatus;
    isRecurring?: boolean;
    skillLevel?: SkillLevel;
    genderPreference?: GenderPreference;
    accessType?: AccessType;
    createdAt?: Date;
    updatedAt?: Date;

    constructor(
        status: GameStatus,
        id?: number,
        sportId?: number, 
        googlePlaceId?: string, 
        gameName?: string, 
        gameDescription?: string, 
        streetAddress?: string, 
        city?: string, 
        state?: string, 
        zipCode?: string, 
        country?: string, 
        latitude?: number, 
        longitude?: number, 
        locationName?: string, 
        locationDescription?: string, 
        maxPlayers?: number, 
        minPlayers?: number, 
        startTime?: Date, 
        endTime?: Date,  
        isRecurring?: boolean,
        skillLevel?: SkillLevel,
        genderPreference?: GenderPreference,
        accessType?: AccessType,
        createdAt?: Date,
        updatedAt?: Date
    ) {
        this.id = id;
        this.status = status;
        this.sportId = sportId;
        this.googlePlaceId = googlePlaceId;
        this.gameName = gameName;
        this.gameDescription = gameDescription;
        this.streetAddress = streetAddress;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.country = country;
        this.latitude = latitude;
        this.longitude = longitude;
        this.locationName = locationName;
        this.locationDescription = locationDescription;
        this.maxPlayers = maxPlayers;
        this.minPlayers = minPlayers;
        this.startTime = startTime;
        this.endTime = endTime;
        this.isRecurring = isRecurring;
        this.skillLevel = skillLevel;
        this.genderPreference = genderPreference;
        this.accessType = accessType;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export enum GameStatus {
    Draft = 'draft',
    Active = 'active',
    Finished = 'finished',
    Coordination = 'coordination',
    Cancelled = 'cancelled'
}

export enum SkillLevel {
    Beginner = 'beginner',
    Intermediate = 'intermediate',
    Advanced = 'advanced',
    All = 'all'
}

export enum AccessType {
    Public = 'public',
    Private = 'private'
}

export enum GenderPreference {
    AllMale = 'all male',
    AllFemale = 'all female',
    Coed = 'coed',
    NoPreference = 'no preference'
}

export interface GameFilter {
    sportIds?: number[];
    skillLevels?: SkillLevel[];
    genderPreferences?: GenderPreference[];
    // distance and location-based filters
    latitude: number;
    longitude: number;
    maxDistance: number;
    //
    favoritesOnly?: boolean;
    happeningTodayOnly?: boolean;
}

export interface GameWithDetails {
    game: Game;
    sportName: string;
    creatorName: string;
    memberProfiles: Profile[];
    userHasJoined: boolean;
    locationName: string;
    latitude: number;
    longitude: number;
}

export interface SearchedGame {
    id: number;
    name: string;
    sportName: string;
    locationName: string;
    creatorName: string;
    startTime: Date;
    endTime: Date;
    skillLevel: SkillLevel;
    genderPreference: GenderPreference;
    currentPlayerCount: number;
    maxPlayers: number;
    currentUserHasJoined: boolean;
}
