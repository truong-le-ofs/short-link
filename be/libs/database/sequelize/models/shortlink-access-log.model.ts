import {
  Table,
  Model,
  Column,
  PrimaryKey,
  AllowNull,
  ForeignKey,
  BelongsTo,
  Default,
  DataType,
} from 'sequelize-typescript';
import { ShortlinkModel } from './shortlink.model';

@Table({
  tableName: 'shortlink_access_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  indexes: [
    { fields: ['shortlink_id'] },
    { fields: ['accessed_at'] },
    { fields: ['ip_address'] },
    { fields: ['country'] },
  ],
})
export class ShortLinkAccessLogModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  declare id: string;

  @Default(DataType.NOW)
  @Column(DataType.DATE)
  declare accessed_at: Date;

  @AllowNull(false)
  @Column(DataType.STRING(45))
  declare ip_address: string;

  @Column(DataType.TEXT)
  declare user_agent: string;

  @Column(DataType.TEXT)
  declare referrer: string;

  @Column(DataType.STRING(50))
  declare country: string;

  @ForeignKey(() => ShortlinkModel)
  @Column(DataType.STRING)
  declare shortlink_id: string;

  @BelongsTo(() => ShortlinkModel)
  declare shortlink: ShortlinkModel;
}
