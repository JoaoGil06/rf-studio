import { Entity } from '../../@shared/entity/entity.abstract.js';
import { InvalidValueError } from '../../@shared/errors/invalidValueError.js';
import { ServiceCategory } from '../../@shared/value-object/service-category/service-category.vo.js';
import { ProductProps, UpdateProductProps } from './product.entity.types.js';

export class Product extends Entity<ProductProps> {
  private _name: string;
  private _brand: string;
  private _color: string | null;
  private _category: ServiceCategory;
  private _isAvailable: boolean;

  private constructor(props: ProductProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this._name = props.name;
    this._brand = props.brand;
    this._color = props.color;
    this._category = props.category;
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
  public get category(): ServiceCategory {
    return this._category;
  }
  public get isAvailable(): boolean {
    return this._isAvailable;
  }

  public updateProductDetails(props: UpdateProductProps): void {
    if (props.name !== undefined) {
      if (props.name.trim().length === 0) {
        throw new InvalidValueError('Product name cannot be empty');
      }
      this._name = props.name;
    }
    if (props.brand !== undefined) {
      if (props.brand.trim().length === 0) {
        throw new InvalidValueError('Product brand cannot be empty');
      }
      this._brand = props.brand;
    }
    if (props.color !== undefined) this._color = props.color;
    if (props.category !== undefined) this._category = new ServiceCategory(props.category);
    if (props.isAvailable !== undefined) this._isAvailable = props.isAvailable;

    this._updatedAt = new Date();
  }
}
