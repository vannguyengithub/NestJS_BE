import { Controller, Post } from '@nestjs/common';
import { DatabasesService } from './databases.service';
import { Public, ResponseMessage } from 'src/decorator/customize';

@Controller('databases')
export class DatabasesController {
  constructor(private readonly databasesService: DatabasesService) {}

  @Post('sync-permissions')
  @Public()
  @ResponseMessage('Sync permissions successfully')
  async syncPermissions() {
    return this.databasesService.syncNewPermissions();
  }
}
