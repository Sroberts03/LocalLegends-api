import { Body, Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { GameService } from './game.service';
import { AuthGuard } from '../common/auth.guard';
import type { GetGamesReq, GetGamesRes, GetSportsRes } from './game.types';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) { }

  @Get('list-games')
  @UseGuards(AuthGuard)
  async listGames(@Request() req: any, @Query() query: GetGamesReq): Promise<GetGamesRes> {
    return await this.gameService.listGames(query, req.user.id);
  }

  @Get('list-sports')
  @UseGuards(AuthGuard)
  async listSports(): Promise<GetSportsRes> {
    return await this.gameService.listSports();
  }
}
