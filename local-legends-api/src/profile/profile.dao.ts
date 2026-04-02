import { Injectable } from "@nestjs/common";
import { SupabaseService } from "src/supabase/supabase.service";
import { DAOUtils } from "src/games/game.dao.utils";
import { EditProfileRequest, EditProfileResponse, GetProfileResponse } from './profile.types';

@Injectable()
export class ProfileDAO {
    constructor(private readonly supabase: SupabaseService) { }

    async getMyProfile(userId: string): Promise<GetProfileResponse> {
        const { data, error } = await this.supabase.client.from('profile_with_stats').select('*').eq('id', userId).single();
        if (error) throw error;

        // Ensure nested game data is mapped correctly (Dates, etc.)
        const last5GamesFormatted = (data.last5Games || []).map((row: any) =>
            DAOUtils.mapRowToGameWithDetails(row, userId)
        );

        return {
            ...data,
            last5Games: last5GamesFormatted
        } as GetProfileResponse;
    }

    async editMyProfile(userId: string, body: EditProfileRequest): Promise<EditProfileResponse> {
        const updateData: any = {};
        if (body.displayName !== undefined) updateData.display_name = body.displayName;
        if (body.bio !== undefined) updateData.bio = body.bio;
        if (body.profilePicture !== undefined) updateData.profile_url = body.profilePicture;

        const { error: updateError } = await this.supabase.client.from('profiles')
            .update(updateData)
            .eq('id', userId);
        
        if (updateError) throw updateError;

        // Return the full updated profile using our efficient view-based method
        return await this.getMyProfile(userId);
    }
}