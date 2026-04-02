import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { SupabaseModule } from './supabase/supabase.module';
import { GameModule } from './games/game.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    HealthModule,
    GameModule,
    ProfileModule,
  ],
})
export class AppModule { }
