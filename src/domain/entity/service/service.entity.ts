import { Entity } from '../../@shared/entity/entity.abstract.js';
import { Price } from '../../@shared/value-object/price/price.vo.js';
import { ServiceCategory } from '../../@shared/value-object/service-category/service-category.vo.js';
import { ServiceProps } from './service.entity.types.js';

export class Service extends Entity<ServiceProps> {
  private readonly _name: string;
  private readonly _category: ServiceCategory;
  private readonly _price: Price;
  private readonly _durationMinutes: number;

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
}
