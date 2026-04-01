import { Injectable } from '@nestjs/common';
import { GetGamesReq, GetGamesRes } from './game.types';
import { GameDAO } from './game.dao';

@Injectable()
export class GameService {
  constructor(private readonly gameDAO: GameDAO) { }

  async listGames(req: GetGamesReq, userId: string): Promise<GetGamesRes> {
    const games = await this.gameDAO.getGames(req, userId);
    return { games };
  }
}
