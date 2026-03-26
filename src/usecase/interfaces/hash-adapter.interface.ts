export interface IHashAdapter {
  hash(plain: string): Promise<string>;
}
