import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { IUserRepository } from '../../domain/repository/user-repository.interface.js';
import { User } from '../../domain/entity/user/user.entity.js';
import { users } from '../db/schema/users.schema.js';
import { eq } from 'drizzle-orm';
import { UserFactory } from '../../domain/entity/user/factory/user.factory.js';

export class UserRepository implements IUserRepository {
  private readonly db: NodePgDatabase;

  constructor(db: NodePgDatabase) {
    this.db = db;
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await this.db.select().from(users).where(eq(users.email, email)).limit(1);

    if (rows.length === 0) return null;

    const row = rows[0];

    return UserFactory.reconstitute({
      id: row.id,
      roleId: row.role_id,
      name: row.name,
      email: row.email,
      passwordHash: row.password,
      phoneNumber: row.phone_number,
      birthDate: row.birth_date ? new Date(row.birth_date) : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async save(user: User): Promise<void> {
    await this.db.insert(users).values({
      id: user.id,
      role_id: user.roleId,
      name: user.name,
      email: user.email.value,
      password: user.passwordHash,
      phone_number: user.phone.value,
      birth_date: user.birthDate ? user.birthDate.toISOString().split('T')[0] : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
