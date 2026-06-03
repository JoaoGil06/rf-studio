import { Entity } from '../../@shared/entity/entity.abstract.js';
import { ProductProps } from './product.entity.types.js';

export class Product extends Entity<ProductProps> {
  private _name: string;
  private _brand: string;
  private _color: string | null;
  private _isAvailable: boolean;

  private constructor(props: ProductProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this._name = props.name;
    this._brand = props.brand;
    this._color = props.color;
    this._isAvailable = props.isAvailable;
  }

  public static _instantiate(props: ProductProps): Product {
    return new Product(props);
  }

  public get name(): string {
    return this._name;
  }
  public get brand(): string {
    return this._brand;
  }
  public get color(): string | null {
    return this._color;
  }
  public get isAvailable(): boolean {
    return this._isAvailable;
  }
}