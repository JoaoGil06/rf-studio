import { Entity } from '../../@shared/entity/entity.abstract.js';
import { InvalidValueError } from '../../@shared/errors/invalidValueError.js';
import { Price } from '../../@shared/value-object/price/price.vo.js';
import { ServiceCategory } from '../../@shared/value-object/service-category/service-category.vo.js';
import { ServiceProps, UpdateServiceProps } from './service.entity.types.js';

export class Service extends Entity<ServiceProps> {
  private _name: string;
  private _category: ServiceCategory;
  private _price: Price;
  private _durationMinutes: number;

  private constructor(props: ServiceProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this._name = props.name;
    this._category = props.category;
    this._price = props.price;
    this._durationMinutes = props.durationMinutes;
  }

  public static _instantiate(props: ServiceProps): Service {
    return new Service(props);
  }

  public get name(): string {
    return this._name;
  }
  public get category(): ServiceCategory {
    return this._category;
  }
  public get price(): Price {
    return this._price;
  }
  public get durationMinutes(): number {
    return this._durationMinutes;
  }

  public updateServiceDetails(props: UpdateServiceProps): void {
    if (props.name !== undefined) this._name = props.name;
    if (props.category !== undefined) this._category = new ServiceCategory(props.category);
    if (props.price !== undefined) this._price = new Price(props.price);
    if (props.durationMinutes !== undefined) {
      if (
        !Number.isInteger(props.durationMinutes) ||
        (props.durationMinutes && props.durationMinutes <= 0)
      ) {
        throw new InvalidValueError(
          `durationMinutes mus be a positive integer: ${props.durationMinutes}`,
        );
      }

      this._durationMinutes = props.durationMinutes;
    }

    this._updatedAt = new Date();
  }
}
