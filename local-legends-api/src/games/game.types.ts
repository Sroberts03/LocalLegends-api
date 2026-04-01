import { GameFilter, GameWithDetails } from "src/common/models/Game";

export interface GetGamesReq {
    filter: GameFilter;
}

export interface GetGamesRes {
    games: GameWithDetails[];
}