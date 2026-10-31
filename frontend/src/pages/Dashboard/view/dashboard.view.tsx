import { CategorySplit } from '../../../components/CategorySplit';
import { Loader } from '../../../components/Loader';
import { PageHeader } from '../../../components/PageHeader';
import { RevenueBars } from '../../../components/RevenueBars';
import { TopClients } from '../../../components/TopClients';
import { TopPolishes } from '../../../components/TopPolishes';
import { ChevronLeftIcon, ChevronRightIcon } from '../../../components/icons';
import { DASHBOARD_COPY } from '../../../utils/constants/dashboardMessages';
import { useDashboardViewModel } from '../viewmodel/dashboard.viewmodel';
import styles from './dashboard.view.module.css';

export function DashboardView() {
  const {
    monthLabel,
    goToPreviousMonth,
    goToNextMonth,
    kpis,
    bars,
    split,
    topClients,
    topPolishes,
    isLoading,
    loadError,
  } = useDashboardViewModel();

  return (
    <main className={styles.page}>
      <PageHeader whisper={DASHBOARD_COPY.whisper} title={DASHBOARD_COPY.title}>
        <div className={styles.monthPicker}>
          <span className={styles.monthPickerLabel}>{DASHBOARD_COPY.monthPicker}</span>
          <div className={styles.monthPill}>
            <button
              type="button"
              className={styles.arrow}
              aria-label={DASHBOARD_COPY.previousMonth}
              onClick={goToPreviousMonth}
            >
              <ChevronLeftIcon className={styles.arrowIcon} />
            </button>
            <span className={styles.month} aria-live="polite">
              {monthLabel}
            </span>
            <button
              type="button"
              className={styles.arrow}
              aria-label={DASHBOARD_COPY.nextMonth}
              onClick={goToNextMonth}
            >
              <ChevronRightIcon className={styles.arrowIcon} />
            </button>
          </div>
        </div>
      </PageHeader>

      {loadError && (
        <p className={styles.loadError} role="alert">
          {loadError}
        </p>
      )}

      {isLoading && <Loader />}

      {!isLoading && !loadError && (
        <>
          <dl className={styles.kpis}>
            {kpis.map((kpi) => (
              <div key={kpi.key} className={styles.kpi}>
                <dt className={styles.kpiLabel}>{kpi.label}</dt>
                <dd className={styles.kpiValue}>{kpi.value}</dd>
              </div>
            ))}
          </dl>

          <div className={styles.split}>
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>
                {DASHBOARD_COPY.barsTitle}{' '}
                <span className={styles.panelAside}>{DASHBOARD_COPY.barsAside}</span>
              </h2>
              <RevenueBars bars={bars} />
              <CategorySplit split={split} />
            </section>

            <div className={styles.side}>
              <section className={styles.panel}>
                <h2 className={styles.panelTitle}>{DASHBOARD_COPY.topClientsTitle}</h2>
                <TopClients clients={topClients} />
              </section>

              <section className={styles.panel}>
                <h2 className={styles.panelTitle}>{DASHBOARD_COPY.topPolishesTitle}</h2>
                <TopPolishes polishes={topPolishes} />
              </section>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
