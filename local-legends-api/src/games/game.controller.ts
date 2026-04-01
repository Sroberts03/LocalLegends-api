import { Body, Controller, Get, UseGuards, Request } from '@nestjs/common';
import { GameService } from './game.service';
import { AuthGuard } from '../common/auth.guard';
import type { GetGamesReq, GetGamesRes } from './game.types';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) { }

  @Get('list-games')
  @UseGuards(AuthGuard)
  async listGames(@Body() body: GetGamesReq, @Request() req: any): Promise<GetGamesRes> {
    return await this.gameService.listGames(body, req.user.id);
  }
}
