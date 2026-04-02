import { Body, Controller, Get, UseGuards, Request, Query, Post, Delete, Put } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from '../common/auth.guard';
import type { EditFavoriteSportsRequest, EditFavoriteSportsResponse, EditProfileRequest, EditProfileResponse, GetProfileResponse } from './profile.types';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @Get('my-profile')
  @UseGuards(AuthGuard)
  async getMyProfile(@Request() req: any): Promise<GetProfileResponse> {
    return await this.profileService.getMyProfile(req.user.id);
  }

  @Put('my-profile')
  @UseGuards(AuthGuard)
  async editMyProfile(
    @Request() req: any,
    @Body() body: EditProfileRequest
  ): Promise<EditProfileResponse> {
    return await this.profileService.editMyProfile(req.user.id, body);
  }

  @Put('my-profile/favorite-sports')
  @UseGuards(AuthGuard)
  async editFavoriteSports(
    @Request() req: any,
    @Body() body: EditFavoriteSportsRequest
  ): Promise<EditFavoriteSportsResponse> {
    return await this.profileService.editFavoriteSports(req.user.id, body);
  }
}
