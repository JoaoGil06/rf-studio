import { Outlet } from 'react-router-dom';
import { Navbar } from '../../../components/Navbar';
import { TabBar } from '../../../components/TabBar';
import styles from './appLayout.view.module.css';

export function AppLayout() {
  return (
    <div className={styles.shell}>
      <Navbar />
      <div className={styles.content}>
        <Outlet />
      </div>
      <TabBar />
    </div>
  );
}
