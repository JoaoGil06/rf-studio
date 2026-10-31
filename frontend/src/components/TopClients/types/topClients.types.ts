export interface TopClient {
  id: string;
  rank: number;
  name: string;
  total: string;
  barPercent: number;
}

export interface TopClientsProps {
  clients: readonly TopClient[];
}

export interface TopClientRowProps {
  client: TopClient;
}
