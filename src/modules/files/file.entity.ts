import {
  Column,
  Model,
  Table,
  CreatedAt,
  UpdatedAt,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Todo } from '../todos/todo.entity';
import { User } from '../users/user.entity';

@Table({
  tableName: 'files',
  timestamps: true,
})
export class File extends Model<File> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare filename: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare originalName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare mimetype: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare size: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare path: string;

  @ForeignKey(() => Todo)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare todoId: string;

  @BelongsTo(() => Todo)
  declare todo: Todo;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
