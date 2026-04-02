import { Body, Controller, Get, UseGuards, Request, Query, Post, Delete } from '@nestjs/common';
import { GameService } from './game.service';
import { AuthGuard } from '../common/auth.guard';
import type { CreateGameReq, CreateGameRes, GetGamesReq, GetGamesRes, GetSportsRes, JoinGameReq, JoinGameRes } from './game.types';

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

  @Post('create-game')
  @UseGuards(AuthGuard)
  async createGame(@Request() req: any, @Body() body: CreateGameReq): Promise<CreateGameRes> {
    return await this.gameService.createGame(body, req.user.id);
  }

  @Get('my-games')
  @UseGuards(AuthGuard)
  async getMyGames(@Request() req: any): Promise<GetGamesRes> {
    return await this.gameService.getMyGames(req.user.id);
  }

  @Post('join-game')
  @UseGuards(AuthGuard)
  async joinGame(@Request() req: any, @Body() body: JoinGameReq): Promise<JoinGameRes> {
    return await this.gameService.joinGame(body.gameId, req.user.id);
  }

  @Delete('leave-game')
  @UseGuards(AuthGuard)
  async leaveGame(@Request() req: any, @Body() body: JoinGameReq): Promise<JoinGameRes> {
    return await this.gameService.leaveGame(body.gameId, req.user.id);
  }
}
