import { Body, Controller, Get, UseGuards, Request, Query, Post, Delete } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from '../common/auth.guard';
import type { GetProfileResponse } from './profile.types';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @Get('my-profile')
  @UseGuards(AuthGuard)
  async getMyProfile(@Request() req: any): Promise<GetProfileResponse> {
    return await this.profileService.getMyProfile(req.user.id);
  }
}
