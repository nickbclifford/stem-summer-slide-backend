import {
	AutoIncrement,
	Column,
	HasMany,
	IsEmail,
	Model,
	PrimaryKey,
	Table, Unique
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
	@Unique
	@Column
	email!: string;

	@Column
	password!: string;

	@Column
	confirmationHash!: string;

	@Column
	confirmed!: boolean;

	@Column
	name!: string;

	@HasMany(() => Answer)
	answers!: Answer[];
}
