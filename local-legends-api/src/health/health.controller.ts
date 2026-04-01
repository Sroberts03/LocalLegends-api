import { Controller, Get, UseGuards } from '@nestjs/common';
import { HealthService } from './health.service';
import { AuthGuard } from '../common/auth.guard';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) { }

  @Get()
  health(): string {
    return this.healthService.health();
  }

  @Get('protected')
  @UseGuards(AuthGuard)
  protectedHandler(): string {
    return 'This is a protected route!';
  }
}
