import {
  Table,
  Model,
  Column,
  PrimaryKey,
  AllowNull,
  Unique,
  Default,
  ForeignKey,
  BelongsTo,
  HasMany,
  DataType,
} from 'sequelize-typescript';
import { UserModel } from './user.model';
import { ShortLinkScheduleModel } from './shortlink-schedule.model';
import { ShortLinkPasswordModel } from './shortlink-password.model';
import { ShortLinkAccessLogModel } from './shortlink-access-log.model';
import { UUIDV4 } from 'sequelize';

@Table({
  tableName: 'shortlinks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  indexes: [
    { unique: true, fields: ['short_code'] },
    { fields: ['user_id'] },
    { fields: ['expires_at'] },
  ],
})
export class ShortlinkModel extends Model {
  @PrimaryKey
  @Default(UUIDV4)
  @Column(DataType.STRING)
  declare id: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(20))
  declare short_code: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare default_url: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  declare is_active: boolean;

  @Column(DataType.DATE)
  declare expires_at: Date;

  @Column(DataType.INTEGER)
  declare access_limit: number;

  @Column(DataType.TEXT)
  declare meta_tag: string;

  @ForeignKey(() => UserModel)
  @Column(DataType.STRING)
  declare user_id: string;

  @BelongsTo(() => UserModel)
  declare user: UserModel;

  @HasMany(() => ShortLinkScheduleModel)
  declare schedules: ShortLinkScheduleModel[];

  @HasMany(() => ShortLinkPasswordModel)
  declare passwords: ShortLinkPasswordModel[];

  @HasMany(() => ShortLinkAccessLogModel)
  declare access_logs: ShortLinkAccessLogModel[];
}
