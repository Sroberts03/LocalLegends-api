import { Injectable } from '@nestjs/common';
import { ProfileDAO } from './profile.dao';
import { EditProfileRequest, EditProfileResponse, GetProfileResponse } from './profile.types';

@Injectable()
export class ProfileService {
  constructor(private readonly profileDAO: ProfileDAO) { }

  async getMyProfile(userId: string): Promise<GetProfileResponse> {
    const profile = await this.profileDAO.getMyProfile(userId);
    return profile;
  }

  async editMyProfile(userId: string, body: EditProfileRequest): Promise<EditProfileResponse> {
    const profile = await this.profileDAO.editMyProfile(userId, body);
    return profile;
  }
}
