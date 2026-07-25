export interface IFeatureFlagProvider {
  isEnabled(key: string): Promise<boolean>;
}
