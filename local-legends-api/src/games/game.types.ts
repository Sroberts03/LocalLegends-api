import { GameFilter, GameWithDetails } from "src/common/models/Game";

export interface GetGamesReq extends GameFilter { }

export interface GetGamesRes {
    games: GameWithDetails[];
}