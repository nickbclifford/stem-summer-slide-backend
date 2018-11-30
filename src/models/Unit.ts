import {
	AutoIncrement,
	Column,
	DataType,
	HasMany,
	Model,
	PrimaryKey,
	Table
} from 'sequelize-typescript';
import Question from './Question';

@Table
export default class Unit extends Model<Unit> {
	@PrimaryKey
	@AutoIncrement
	@Column
	id!: number;

	@Column
	title!: string;

	@Column(DataType.TEXT)
	description!: string;

	@HasMany(() => Question)
	questions!: Question[];
}
