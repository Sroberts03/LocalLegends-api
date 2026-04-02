import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { ProfileDAO } from './profile.dao';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileDAO],
})
export class ProfileModule { }
