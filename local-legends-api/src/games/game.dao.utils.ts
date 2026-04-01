import Game, { GameWithDetails } from "../common/models/Game";

export class DAOUtils {
    static mapRowToGame(row: any): Game {
        return new Game(
            row.id,
            row.sport_id,
            row.creator_id,
            row.location_id,
            row.name,
            row.description,
            row.max_players,
            row.min_players,
            row.status,
            new Date(row.start_time),
            new Date(row.end_time),
            row.is_recurring,
            row.skill_level,
            row.gender_preference,
            row.current_player_count,
            row.access_type,
            new Date(row.created_at),
            new Date(row.updated_at)
        );
    }

    static mapRowToProfile(p: any) {
        return {
            id: p.id,
            displayName: p.displayName,
            bio: p.bio,
            status: p.status,
            profileImageUrl: p.profileImageUrl,
            yearJoined: p.createdAt ? new Date(p.createdAt).getFullYear() : new Date().getFullYear()
        };
    }

    static mapRowToGameWithDetails(row: any, userId: string): GameWithDetails {
        const memberProfiles = (row.participant_profiles || []).map((p: any) =>
            this.mapRowToProfile(p)
        );

        return {
            game: this.mapRowToGame(row),
            sportName: row.sport_name,
            creatorName: row.creator_name,
            locationName: row.location_name,
            latitude: row.location_latitude,
            longitude: row.location_longitude,
            memberProfiles: memberProfiles,
            userHasJoined: memberProfiles.some((p: any) => p.id === userId)
        };
    }
}
