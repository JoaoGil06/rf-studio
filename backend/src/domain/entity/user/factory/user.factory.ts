import { randomUUID } from 'crypto';
import { User } from '../user.entity.js';
import { CreateUserProps, ReconstituteUserProps } from './user.factory.types.js';
import { Email } from '../../../@shared/value-object/email/email.vo.js';
import { Phone } from '../../../@shared/value-object/phone/phone.vo.js';

export class UserFactory {
  public static create(props: CreateUserProps) {
    const now = new Date();
    return User._instantiate({
      id: randomUUID(),
      roleId: props.roleId,
      name: props.name,
      email: new Email(props.email),
      passwordHash: props.passwordHash,
      phone: new Phone(props.phoneNumber),
      birthDate: props.birthDate ? new Date(props.birthDate) : null,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: ReconstituteUserProps) {
    return User._instantiate({
      id: props.id,
      roleId: props.roleId,
      name: props.name,
      email: new Email(props.email),
      passwordHash: props.passwordHash,
      phone: new Phone(props.phoneNumber),
      birthDate: props.birthDate,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }
}
