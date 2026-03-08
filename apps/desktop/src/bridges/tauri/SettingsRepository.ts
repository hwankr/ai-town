export class SettingsRepository {
  async load(): Promise<{ locale: string }> {
    return { locale: 'ko-KR' };
  }
}
