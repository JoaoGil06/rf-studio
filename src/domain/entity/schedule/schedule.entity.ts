import { Entity } from '../../@shared/entity/entity.abstract.js';
import { InvalidValueError } from '../../@shared/errors/invalidValueError.js';
import { ScheduleStatus } from '../../@shared/value-object/schedule-status/schedule-status.vo.js';
import { ScheduleProps, UpdateScheduleProps } from './schedule.entity.types.js';

export class Schedule extends Entity<ScheduleProps> {
  private readonly _userId: string;
  private _serviceId: string;
  private _status: ScheduleStatus;
  private _date: Date;
  private _photoUrl: string | null;
  private _tip: number | null;

  private constructor(props: ScheduleProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this._userId = props.userId;
    this._serviceId = props.serviceId;
    this._status = props.status;
    this._date = props.date;
    this._photoUrl = props.photoUrl;
    this._tip = props.tip;
  }

  public static _instantiate(props: ScheduleProps): Schedule {
    return new Schedule(props);
  }

  public get userId(): string {
    return this._userId;
  }
  public get serviceId(): string {
    return this._serviceId;
  }
  public get status(): ScheduleStatus {
    return this._status;
  }
  public get date(): Date {
    return this._date;
  }
  public get photoUrl(): string | null {
    return this._photoUrl;
  }

  public get tip(): number | null {
    return this._tip;
  }

  public updateScheduleDetails(props: UpdateScheduleProps): void {
    if (props.status !== undefined) this._status = new ScheduleStatus(props.status);
    if (props.serviceId !== undefined) this._serviceId = props.serviceId;
    if (props.date !== undefined) {
      if (!(props.date instanceof Date) || !Number.isFinite(props.date.getTime())) {
        throw new InvalidValueError(`Invalid schedule date: ${String(props.date)}`);
      }
      this._date = props.date;
    }
    if (props.photoUrl !== undefined) this._photoUrl = props.photoUrl;

    this._updatedAt = new Date();
  }

  public applyTip(tip: number | null): void {
    if (tip !== null && (!Number.isFinite(tip) || tip < 0)) {
      throw new InvalidValueError(`Invalid tip: ${String(tip)}`);
    }
    this._tip = tip;
    this._updatedAt = new Date();
  }
}
