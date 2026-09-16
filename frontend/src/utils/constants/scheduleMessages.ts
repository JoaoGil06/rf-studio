import type { ScheduleStatus } from '../../graphql/generated/graphql';

export const SCHEDULE_ERROR_MESSAGES = {
  load: 'Não foi possível carregar a agenda. Tente novamente.',
  network: 'Não foi possível ligar ao servidor. Tente novamente.',
  badInput: 'Verifique os dados da reserva.',
  alreadyBooked: 'Já existe uma reserva nessa hora.',
  timeTaken: 'Essa hora deixou de estar livre. Escolha outra.',
  clientNotFound: 'Esta cliente já não existe.',
  serviceNotFound: 'Este serviço já não existe.',
} as const;

export const AGENDA_COPY = {
  whisper: 'agenda de',
  previousMonth: 'Mês anterior',
  nextMonth: 'Mês seguinte',
  closedDay: 'O estúdio está fechado ao domingo.',
  closedDayShort: 'FECHADO',
  freeSlot: 'livre',
  coveredSlot: 'continuação',
  dayCountOne: '1 RESERVA',
  dayCountMany: 'RESERVAS',
  dayCountNone: 'SEM RESERVAS',
  reservationOne: 'reserva',
  reservationMany: 'reservas',
  closedDayAside: 'fechado',
  emptyMonth: 'Sem reservas neste mês.',
  statReservations: 'RESERVAS',
  statPending: 'PENDENTES',
  statRevenue: 'FATURADO NO MÊS',
  legendLabel: 'Estados de reserva',

  hintDesk: 'Toque num dia para criar uma reserva.',
  hintPane: 'Toque num dia para o abrir · use Nova reserva para marcar',
} as const;

export const BOOKING_COPY = {
  whisper: 'nova reserva',
  pendingNote: 'A reserva entra no estado Pendente — confirma-se depois de falar com a cliente.',
  timeLabel: 'Hora',
  clientLabel: 'Cliente',
  serviceLabel: 'Serviço',
  choosePlaceholder: '— escolher —',
  timeLockedPlaceholder: '— escolha primeiro o serviço —',
  takenSuffix: 'ocupado',
  submit: 'CRIAR RESERVA',
  busy: 'A CRIAR…',
  addAction: 'Nova reserva',
  addOn: 'Nova reserva em',
  clientsTruncated: 'A lista mostra as primeiras clientes. Procure a restante em Clientes.',
} as const;

export const SCHEDULES_COPY = {
  whisper: 'estados das',
  title: 'Reservas',
  tabsLabel: 'Estado das reservas',
  load: 'Não foi possível carregar as reservas. Tente novamente.',
} as const;

export const SCHEDULES_EMPTY: Record<ScheduleStatus, { title: string; body: string }> = {
  pending: {
    title: 'Nada à espera de si',
    body: 'Sem reservas pendentes. Quando chegar um contacto novo, aparece aqui.',
  },
  confirmed: {
    title: 'Sem reservas confirmadas',
    body: 'As reservas que confirmar ficam aqui até serem concluídas.',
  },
  completed: {
    title: 'Ainda sem reservas concluídas',
    body: 'Cada reserva que concluir fica registada aqui.',
  },
  cancelled: {
    title: 'Sem reservas canceladas',
    body: 'Uma reserva cancelada continua registada aqui — o livro não apaga.',
  },
};
