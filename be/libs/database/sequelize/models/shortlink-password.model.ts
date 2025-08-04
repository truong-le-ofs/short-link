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
  tableName: 'shortlink_passwords',
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
export class ShortLinkPasswordModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare password: string;

  @Column(DataType.DATE)
  declare start_time: Date;

  @Column(DataType.DATE)
  declare end_time: Date;

  @ForeignKey(() => ShortlinkModel)
  @Column(DataType.STRING)
  declare shortlink_id: string;

  @BelongsTo(() => ShortlinkModel)
  declare shortlink: ShortlinkModel;
}
