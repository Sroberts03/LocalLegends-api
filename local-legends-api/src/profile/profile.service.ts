import { Injectable } from '@nestjs/common';
import { ProfileDAO } from './profile.dao';
import { GetProfileResponse } from './profile.types';

@Injectable()
export class ProfileService {
  constructor(private readonly profileDAO: ProfileDAO) { }

  async getMyProfile(userId: string): Promise<GetProfileResponse> {
    const profile = await this.profileDAO.getMyProfile(userId);
    return profile;
  }
}
