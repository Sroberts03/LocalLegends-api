import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private clientInstance: SupabaseClient;

  constructor(private configService: ConfigService) {}

  get client(): SupabaseClient {
    if (this.clientInstance) {
      return this.clientInstance;
    }

    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SECRET_API_KEY');

    if (!supabaseUrl || !supabaseKey) {
      this.logger.error('Supabase URL or Key is missing in environment variables');
      throw new Error('Supabase configuration missing');
    }

    this.clientInstance = createClient(supabaseUrl, supabaseKey);
    this.logger.log('Supabase client initialized');
    return this.clientInstance;
  }
}
