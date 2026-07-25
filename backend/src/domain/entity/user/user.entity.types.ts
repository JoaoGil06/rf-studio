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

// Aqui é Profile porque os outros campos não são para atualizar
export interface UpdateProfileProps {
  name?: string;
  email?: string;
  phoneNumber?: string;
  birthDate?: string | null;
}
