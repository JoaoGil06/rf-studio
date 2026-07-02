import { randomUUID } from 'crypto';
import { Schedule } from '../schedule.entity.js';
import { ScheduleStatus } from '../../../@shared/value-object/schedule-status/schedule-status.vo.js';
import { InvalidValueError } from '../../../@shared/errors/invalidValueError.js';
import { CreateScheduleProps, ReconstituteScheduleProps } from './schedule.factory.types.js';

const assertValidDate = (date: Date): void => {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
    throw new InvalidValueError(`Invalid schedule date: ${String(date)}`);
  }
};

export class ScheduleFactory {
  public static create(props: CreateScheduleProps): Schedule {
    assertValidDate(props.date);
    const now = new Date();
    return Schedule._instantiate({
      id: randomUUID(),
      userId: props.userId,
      serviceId: props.serviceId,
      status: new ScheduleStatus(props.status ?? 'pending'),
      date: props.date,
      photoUrl: props.photoUrl ?? null,
      tip: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: ReconstituteScheduleProps): Schedule {
    assertValidDate(props.date);
    return Schedule._instantiate({
      id: props.id,
      userId: props.userId,
      serviceId: props.serviceId,
      status: new ScheduleStatus(props.status),
      date: props.date,
      photoUrl: props.photoUrl,
      tip: props.tip,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }
}
