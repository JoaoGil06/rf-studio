import { useMemo } from 'react';
import { DASHBOARD_COPY } from '../../../utils/constants/dashboardMessages';
import type { TopClientRowProps, TopClientsProps } from '../types/topClients.types';
import styles from './topClients.view.module.css';

function TopClientRow({ client }: TopClientRowProps) {
  const barStyle = useMemo(() => ({ width: `${client.barPercent}%` }), [client.barPercent]);

  return (
    <li className={styles.row}>
      <div className={styles.line}>
        <span className={styles.who}>
          <span className={styles.rank}>{client.rank}</span>
          <span className={styles.name}>{client.name}</span>
        </span>
        <span className={styles.total}>{client.total}</span>
      </div>
      <div className={styles.track} aria-hidden="true">
        <div className={styles.bar} style={barStyle} data-testid="client-bar" />
      </div>
    </li>
  );
}

export function TopClients({ clients }: TopClientsProps) {
  if (clients.length === 0) {
    return <p className={styles.empty}>{DASHBOARD_COPY.topClientsEmpty}</p>;
  }

  return (
    <ol className={styles.list}>
      {clients.map((client) => (
        <TopClientRow key={client.id} client={client} />
      ))}
    </ol>
  );
}
