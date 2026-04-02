import { Injectable } from '@nestjs/common';
import { CreateGameReq, CreateGameRes, GetGamesReq, GetGamesRes, GetSportsRes, JoinGameRes } from './game.types';
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

  async createGame(req: CreateGameReq, userId: string): Promise<CreateGameRes> {
    try {
      const game = await this.gameDAO.createGame(req, userId);
      return { game };
    } catch (error) {
      throw new Error('An unknown error occurred while creating the game. Please try again later.');
    }
  }

  async getMyGames(userId: string): Promise<GetGamesRes> {
    const games = await this.gameDAO.getMyGames(userId);
    return { games };
  }

  async joinGame(gameId: string, userId: string): Promise<JoinGameRes> {
    try {
      await this.gameDAO.joinGame(gameId, userId);
      return { success: true, message: 'Successfully joined the game.' };
    } catch (error) {
      throw new Error('An unknown error occurred while joining the game. Please try again later.');
    }
  }

  async leaveGame(gameId: string, userId: string): Promise<JoinGameRes> {
    try {
      await this.gameDAO.leaveGame(gameId, userId);
      return { success: true, message: 'Successfully left the game.' };
    } catch (error) {
      throw new Error('An unknown error occurred while leaving the game. Please try again later.');
    }
  }
}
