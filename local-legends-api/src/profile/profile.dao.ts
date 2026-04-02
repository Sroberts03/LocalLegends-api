import { Injectable } from "@nestjs/common";
import { SupabaseService } from "src/supabase/supabase.service";
import { DAOUtils } from "src/games/game.dao.utils";
import { GetProfileResponse } from './profile.types';

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
}