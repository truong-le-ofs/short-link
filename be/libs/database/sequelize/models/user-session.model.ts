import {
  Table,
  Model,
  Column,
  PrimaryKey,
  AllowNull,
  ForeignKey,
  BelongsTo,
  DataType,
  Default,
} from 'sequelize-typescript';
import { UserModel } from './user.model';

@Table({
  tableName: 'user_sessions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  indexes: [{ fields: ['user_id'] }, { fields: ['expires_at'] }],
})
export class UserSessionModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  declare expires_at: Date;

  @Column(DataType.TEXT)
  declare user_agent: string;

  @ForeignKey(() => UserModel)
  @Column(DataType.STRING)
  declare user_id: string;

  @BelongsTo(() => UserModel)
  declare user: UserModel;
}
