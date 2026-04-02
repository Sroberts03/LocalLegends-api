import { Injectable } from "@nestjs/common";
import { SupabaseService } from "src/supabase/supabase.service";
import Game, { GameFilter, GameStatus, GameWithDetails } from "src/common/models/Game";
import { DAOUtils } from "src/games/game.dao.utils";
import Sport from "src/common/models/Sport";
import { CreateGameReq } from "./game.types";
import Location from "src/common/models/Location";

@Injectable()
export class GameDAO {
    constructor(private readonly supabase: SupabaseService) { }

    async getGames(filter: GameFilter, userId: string): Promise<GameWithDetails[]> {
        // 1. Fetch auxiliary data
        const { favIds, joinedIds } = await this.fetchUserContext(userId);
        console.log(filter);

        // 2. Early return for "Favorites Only" if no favorites exist
        if (filter.favoritesOnly === true && favIds.length === 0) {
            return [];
        }

        // 3. Build & Apply Filters
        let query = this.prepareBaseQuery(filter);
        query = this.applyFilters(query, filter, userId, joinedIds, favIds);

        const { data, error } = await query;
        if (error) throw error;
        console.log(data);

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

    private isValDefined(val: any): boolean {
        return val !== undefined && val !== null && String(val) !== 'undefined' && String(val).trim() !== '';
    }

    private prepareBaseQuery(filter: GameFilter) {
        const { latitude, longitude, maxDistance } = filter;
        const hasLocationFilter = this.isValDefined(latitude) && this.isValDefined(longitude) && this.isValDefined(maxDistance);

        if (hasLocationFilter) {
            return this.supabase.client.rpc('get_nearby_games', {
                lat: Number(latitude),
                lng: Number(longitude),
                max_dist_meters: Number(maxDistance) * 1609.34,
            });
        }

        return this.supabase.client.from('games_with_details').select('*');
    }

    private applyFilters(query: any, filter: GameFilter, userId: string, joinedIds: string[], favIds: string[]) {
        const favoritesOnly = String(filter.favoritesOnly) === 'true';
        const happeningTodayOnly = String(filter.happeningTodayOnly) === 'true';

        query = query
            .eq('status', 'active')
            .eq('access_type', 'public')
            .eq('has_space', true)
            .neq('creator_id', userId);

        // Exclusion/Inclusion logic
        if (joinedIds.length > 0) {
            query = query.not('id', 'in', `(${joinedIds.join(',')})`);
        }

        if (favoritesOnly === true) {
            query = query.in('sport_id', favIds);
        }

        // Helper to ensure we have a clean array of values, even if they arrive as comma-separated strings or via [] suffix
        const getFilterArray = (primaryKey: string): string[] => {
            const arrayKey = `${primaryKey}[]`;
            const val = filter[primaryKey] || (filter as any)[arrayKey];
            
            if (!this.isValDefined(val)) return [];
            
            // Normalize to array, potentially decoding URL segments
            const rawArray = Array.isArray(val) 
                ? val 
                : String(val).split(',').map(v => v.trim());
            
            return rawArray
                .map(v => decodeURIComponent(v))
                .filter(v => this.isValDefined(v));
        };

        // Optional request filters
        const sportIds = getFilterArray('sportIds');
        const skillLevels = getFilterArray('skillLevels');
        const genderPreferences = getFilterArray('genderPreferences');

        console.log('Applied Filters:', { sportIds, skillLevels, genderPreferences });

        if (sportIds.length > 0) {
            query = query.in('sport_id', sportIds);
        }

        if (skillLevels.length > 0) {
            query = query.in('skill_level', skillLevels);
        }

        if (genderPreferences.length > 0) {
            query = query.in('gender_preference', genderPreferences);
        }

        if (happeningTodayOnly) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            query = query.gte('start_time', today.toISOString()).lte('start_time', tomorrow.toISOString());
        }

        return query;
    }

    async getSports(): Promise<Sport[]> {
        const { data, error } = await this.supabase.client.from('sports').select('*');
        if (error) throw error;
        return data as Sport[];
    }

    async createGame(req: CreateGameReq, userId: string): Promise<Game> {
        const { data: existingLocation, error: locationError } = 
            await this.supabase.client.from('locations')
            .select('id').eq('google_place_id', req.googlePlaceId)
            .maybeSingle();
        
        if (locationError) throw locationError;
        
        let locationId = existingLocation?.id;

        if (!locationId) {
            const newLocation = await this.createNewLocation(
                req.googlePlaceId,
                req.locationName,
                req.locationDescription,
                req.streetAddress,
                req.city,
                req.state,
                req.zipCode,
                req.latitude,
                req.longitude
            );
            locationId = newLocation?.id;
        }
            
        const { data, error } = await this.supabase.client.from('games').insert({
            sport_id: req.sportId,
            creator_id: userId,
            location_id: locationId,
            name: req.gameName,
            description: req.gameDescription,
            max_players: req.maxPlayers,
            min_players: req.minPlayers,
            status: GameStatus.Active,
            start_time: req.startTime,
            end_time: req.endTime,
            is_recurring: req.isRecurring,
            skill_level: req.skillLevel,
            gender_preference: req.genderPreference,
            access_type: req.accessType,
        }).select().single();
        if (error) throw error;

        await this.addUserToGame(userId, data.id);

        return data as unknown as Game;
    }

    async createNewLocation(
        googlePlaceId: string, 
        locationName: string, 
        locationDescription: string, 
        streetAddress: string, 
        city: string, 
        state: string, 
        zipCode: string, 
        latitude: number, 
        longitude: number): Promise<Location | null> {
        const { data, error } = await this.supabase.client.from('locations').insert({
            google_place_id: googlePlaceId,
            name: locationName,
            description: locationDescription,
            street_address: streetAddress,
            city: city,
            state: state,
            zip: zipCode,
            latitude: latitude,
            longitude: longitude,
        }).select().maybeSingle();
        
        if (error) throw error;
        return data as Location;
    }
    
    async addUserToGame(userId: string, gameId: string): Promise<void> {
        const { error } = await this.supabase.client.from('user_games').insert({
            user_id: userId,
            game_id: gameId,
        });
        if (error) throw error;
    }

    async getMyGames(userId: string): Promise<GameWithDetails[]> {
        const { data, error } = await this.supabase.client
            .from('games_with_details')
            .select('*, user_games!inner(user_id)')
            .eq('user_games.user_id', userId);
            
        if (error) throw error;
        
        return (data as any[]).map(row => DAOUtils.mapRowToGameWithDetails(row, userId));
    }

    async joinGame(gameId: string, userId: string): Promise<void> {
        const { error } = await this.supabase.client.from('user_games').insert({
            user_id: userId,
            game_id: gameId,
        });
        if (error) throw error;
    }

    async leaveGame(gameId: string, userId: string): Promise<void> {
        const { error } = await this.supabase.client.from('user_games').delete()
            .eq('user_id', userId)
            .eq('game_id', gameId);
        if (error) throw error;
    }
}