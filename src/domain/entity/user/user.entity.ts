import { Entity } from '../../@shared/entity/entity.abstract.js';
import { Email } from '../../@shared/value-object/email/email.vo.js';
import { Phone } from '../../@shared/value-object/phone/phone.vo.js';
import { UserProps } from './user.entity.types.js';

export class User extends Entity<UserProps> {
  private readonly _roleId: string;
  private readonly _name: string;
  private readonly _email: Email;
  private readonly _passwordHash: string;
  private readonly _phone: Phone;
  private readonly _birthDate: Date | null;

  private constructor(props: UserProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this._roleId = props.roleId;
    this._name = props.name;
    this._email = props.email;
    this._passwordHash = props.passwordHash;
    this._phone = props.phone;
    this._birthDate = props.birthDate;
  }

  public static _instantiate(props: UserProps): User {
    return new User(props);
  }

  public get roleId(): string {
    return this._roleId;
  }
  public get name(): string {
    return this._name;
  }
  public get email(): Email {
    return this._email;
  }
  public get passwordHash(): string {
    return this._passwordHash;
  }
  public get phone(): Phone {
    return this._phone;
  }
  public get birthDate(): Date | null {
    return this._birthDate;
  }
}
