import {
  Model,
  Column,
  PrimaryKey,
  Table,
  HasMany,
} from "sequelize-typescript";
import AccountModel from "./account.model";

@Table({
  tableName: "users",
})
export default class UserModel extends Model {
  @PrimaryKey
  @Column
  declare id: string;

  @Column({ allowNull: false })
  declare name: string;

  @Column({ allowNull: false })
  declare email: string;

  @Column({ allowNull: false })
  declare password: string;

  @HasMany(() => AccountModel)
  declare accounts: AccountModel[];
}
