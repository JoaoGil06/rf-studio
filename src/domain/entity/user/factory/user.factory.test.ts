import { describe, it, expect } from 'vitest';
import { UserFactory } from './user.factory.js';
import { randomUUID } from 'crypto';

const email = 'anarita@example.com';
const id = randomUUID();

describe('UserFactory', () => {
  const baseProps = {
    roleId: 'role-uuid',
    name: 'Ana Rita',
    email,
    passwordHash: 'hashed',
    phoneNumber: '+351912345678',
  };

  describe('Create User', () => {
    it('should generate a new UUID', () => {
      const user = UserFactory.create(baseProps);
      expect(user.id).toBeDefined();
    });

    it('should store email as lowercase', () => {
      const user = UserFactory.create({ ...baseProps, email: 'ANARITA@EXAMPLE.COM' });
      expect(user.email.value).toBe(email);
    });
  });

  describe('Reconstitute User', () => {
    it('should preserve the provided id', () => {
      const user = UserFactory.reconstitute({
        ...baseProps,
        id,
        birthDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(user.id).toBe(id);
    });

    describe('when the id is the same', () => {
      it('should reconstitute the same user', () => {
        const now = new Date();
        const a = UserFactory.reconstitute({
          ...baseProps,
          id,
          birthDate: null,
          createdAt: now,
          updatedAt: now,
        });
        const b = UserFactory.reconstitute({
          ...baseProps,
          id,
          birthDate: null,
          createdAt: now,
          updatedAt: now,
        });
        expect(a.equals(b)).toBe(true);
      });
    });
  });
});
