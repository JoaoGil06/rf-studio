import { Email } from '../../@shared/value-object/email/email.vo.js';
import { Phone } from '../../@shared/value-object/phone/phone.vo.js';

export interface UserProps {
  id: string;
  roleId: string;
  name: string;
  email: Email;
  passwordHash: string;
  phone: Phone;
  birthDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
