import { Injectable } from '@nestjs/common';
import { GetGamesReq, GetGamesRes, GetSportsRes } from './game.types';
import { GameDAO } from './game.dao';

@Injectable()
export class GameService {
  constructor(private readonly gameDAO: GameDAO) { }

  async listGames(req: GetGamesReq, userId: string): Promise<GetGamesRes> {
    const games = await this.gameDAO.getGames(req, userId);
    return { games };
  }

  async listSports(): Promise<GetSportsRes> {
    const sports = await this.gameDAO.getSports();
    return { sports };
  }
}
