import {
  Table,
  Model,
  Column,
  PrimaryKey,
  AllowNull,
  Unique,
  IsEmail,
  Default,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import { UserSessionModel } from './user-session.model';
import { ShortlinkModel } from './shortlink.model';

@Table({
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  indexes: [
    { unique: true, fields: ['username'] },
    { unique: true, fields: ['email'] },
  ],
})
export class UserModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  declare id: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(50))
  declare username: string;

  @Unique
  @AllowNull(false)
  @IsEmail
  @Column(DataType.STRING(100))
  declare email: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare password: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare is_verified: boolean;

  @Column(DataType.STRING(100))
  declare verification_token: string;

  @HasMany(() => UserSessionModel)
  declare sessions: UserSessionModel[];

  @HasMany(() => ShortlinkModel)
  declare shortlinks: ShortlinkModel[];
}
