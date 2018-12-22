import {
	AutoIncrement,
	Column,
	HasMany,
	IsEmail,
	Model,
	PrimaryKey,
	Table
} from 'sequelize-typescript';
import Answer from './Answer';

@Table
export default class User extends Model<User> {
	@PrimaryKey
	@AutoIncrement
	@Column
	id!: number;

	@Column
	admin!: boolean;

	@IsEmail
	@Column
	email!: string;

	@Column
	password!: string;

	@HasMany(() => Answer)
	answers!: Answer[];
}
