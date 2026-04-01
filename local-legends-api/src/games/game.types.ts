import { GameFilter, GameWithDetails } from "src/common/models/Game";
import Sport from "src/common/models/Sport";

export interface GetGamesReq extends GameFilter { }

export interface GetGamesRes {
    games: GameWithDetails[];
}

export interface GetSportsRes {
    sports: Sport[];
}