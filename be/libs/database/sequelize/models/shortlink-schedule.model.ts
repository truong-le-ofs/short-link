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
import { ShortlinkModel } from './shortlink.model';

@Table({
  tableName: 'shortlink_schedules',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  indexes: [
    { fields: ['shortlink_id'] },
    { fields: ['start_time'] },
    { fields: ['end_time'] },
  ],
})
export class ShortLinkScheduleModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare target_url: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  declare start_time: Date;

  @AllowNull(false)
  @Column(DataType.DATE)
  declare end_time: Date;

  @ForeignKey(() => ShortlinkModel)
  @Column(DataType.STRING)
  declare shortlink_id: string;

  @BelongsTo(() => ShortlinkModel)
  declare shortlink: ShortlinkModel;

  @Column(DataType.DATE)
  declare created_at: Date;

  @Column(DataType.DATE)
  declare updated_at: Date;

  @Column(DataType.DATE)
  declare deleted_at: Date;
}
