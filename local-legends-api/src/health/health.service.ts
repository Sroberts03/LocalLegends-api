import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  health(): string {
    return 'Local Legends API is running!';
  }
}
