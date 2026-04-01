import { Injectable } from "@nestjs/common";
import { SupabaseService } from "src/supabase/supabase.service";
import { GameFilter, GameWithDetails } from "src/common/models/Game";
import { DAOUtils } from "src/games/game.dao.utils";

@Injectable()
export class GameDAO {
    constructor(private readonly supabase: SupabaseService) { }

    async getGames(filter: GameFilter, userId: string): Promise<GameWithDetails[]> {
        // 1. Fetch auxiliary data
        const { favIds, joinedIds } = await this.fetchUserContext(userId);

        // 2. Early return for "Favorites Only" if no favorites exist
        if (filter.favoritesOnly && favIds.length === 0) {
            return [];
        }

        // 3. Build & Apply Filters
        let query = this.prepareBaseQuery(filter);
        query = this.applyFilters(query, filter, userId, joinedIds, favIds);

        const { data, error } = await query;
        if (error) throw error;

        // 4. Map results using DAOUtils
        return (data as any[]).map(row => DAOUtils.mapRowToGameWithDetails(row, userId));
    }

    private async fetchUserContext(userId: string) {
        const { data: favoriteSports, error: favError } = await this.supabase.client
            .from('user_favorite_sports').select('sport_id').eq('user_id', userId);

        const { data: joinedGames, error: joinError } = await this.supabase.client
            .from('user_games').select('game_id').eq('user_id', userId);

        if (favError) throw favError;
        if (joinError) throw joinError;

        return {
            favIds: favoriteSports?.map((s: any) => s.sport_id) || [],
            joinedIds: joinedGames?.map((g: any) => g.game_id) || []
        };
    }

    private prepareBaseQuery(filter: GameFilter) {
        const hasLocationFilter = filter.latitude && filter.longitude && filter.maxDistance;

        if (hasLocationFilter) {
            return this.supabase.client.rpc('get_nearby_games', {
                lat: filter.latitude,
                lng: filter.longitude,
                max_dist_meters: filter.maxDistance * 1609.34,
            });
        }

        return this.supabase.client.from('games_with_details').select('*');
    }

    private applyFilters(query: any, filter: GameFilter, userId: string, joinedIds: string[], favIds: number[]) {
        query = query
            .eq('status', 'active')
            .eq('access_type', 'public')
            .eq('has_space', true)
            .neq('creator_id', userId);

        // Exclusion/Inclusion logic
        if (joinedIds.length > 0) {
            query = query.nin('id', joinedIds);
        }

        if (filter.favoritesOnly) {
            query = query.in('sport_id', favIds);
        }

        // Optional request filters
        if (filter.sportIds?.length) {
            query = query.in('sport_id', filter.sportIds);
        }

        if (filter.skillLevels?.length) {
            query = query.in('skill_level', filter.skillLevels);
        }

        if (filter.genderPreferences?.length) {
            query = query.in('gender_preference', filter.genderPreferences);
        }

        if (filter.happeningTodayOnly) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            query = query.gte('start_time', today.toISOString()).lte('start_time', tomorrow.toISOString());
        }

        return query;
    }
}