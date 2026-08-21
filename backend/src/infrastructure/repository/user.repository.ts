import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { IUserRepository } from '../../domain/repository/user-repository.interface.js';
import { User } from '../../domain/entity/user/user.entity.js';
import { users } from '../db/schema/users.schema.js';
import { desc, eq } from 'drizzle-orm';
import { UserFactory } from '../../domain/entity/user/factory/user.factory.js';
import { roles } from '../db/schema/roles.schema.js';

export class UserRepository implements IUserRepository {
  private readonly db: NodePgDatabase;

  constructor(db: NodePgDatabase) {
    this.db = db;
  }

  async findById(id: string): Promise<User | null> {
    const rows = await this.db.select().from(users).where(eq(users.id, id)).limit(1);

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

  async findAll(params: { limit: number; offset: number; roleId?: string }): Promise<User[]> {
    const rows = await this.db
      .select()
      .from(users)
      .where(params.roleId ? eq(users.role_id, params.roleId) : undefined)
      .orderBy(desc(users.createdAt), desc(users.id))
      .limit(params.limit)
      .offset(params.offset);

    const rowsForResponse = rows.map((row) =>
      UserFactory.reconstitute({
        id: row.id,
        roleId: row.role_id,
        name: row.name,
        email: row.email,
        passwordHash: row.password,
        phoneNumber: row.phone_number,
        birthDate: row.birth_date ? new Date(row.birth_date) : null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }),
    );

    return rowsForResponse;
  }

  async findRoleIdByName(name: string): Promise<string | null> {
    const rows = await this.db.select().from(roles).where(eq(roles.name, name)).limit(1);

    if (rows.length === 0) return null;

    const { id } = rows[0];

    return id;
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

  async update(user: User): Promise<void> {
    await this.db
      .update(users)
      .set({
        name: user.name,
        email: user.email.value,
        phone_number: user.phone.value,
        birth_date: user.birthDate ? user.birthDate.toISOString().split('T')[0] : null,
        updatedAt: user.updatedAt,
      })
      .where(eq(users.id, user.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }
}
