import { AutoIncrement, Column, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import Answer from './Answer';

@Table
export default class User extends Model<User> {
	@PrimaryKey
	@AutoIncrement
	@Column
	id!: number;

	@Column
	admin!: boolean;

	@HasMany(() => Answer)
	answers!: Answer[];
}
