import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getGame(id: string) {
    return this.appService.getGame(id);
  }

  @Get()
  getGames() {
    return this.appService.getGames();
  }
}
