import { Injectable } from '@nestjs/common';
import { SettingsRepository } from './settings.repository';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  async getSettings() {
    return this.settingsRepository.findOrCreate();
  }

  async updateSettings(dto: UpdateSettingsDto) {
    const settings = await this.settingsRepository.findOrCreate();
    return this.settingsRepository.update(settings.id, dto);
  }
}
