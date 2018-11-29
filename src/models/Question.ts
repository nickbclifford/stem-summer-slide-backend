import { AutoIncrement, Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import Answer from './Answer';

export enum QuestionType {
	SCIENCE = 'Science',
	TECHNOLOGY = 'Technology',
	ENGINEERING = 'Engineering',
	MATHEMATICS = 'Mathematics'
}

@Table
export default class Question extends Model<Question> {
	@PrimaryKey
	@AutoIncrement
	@Column
	id!: number;

	@Column
	body!: string;

	@Column(DataType.ENUM(Object.values(QuestionType)))
	type!: QuestionType;

	@Column
	unit!: number;

	// Only present on math/numerical questions
	@Column
	correctAnswer!: number | null;

	@HasMany(() => Answer)
	answers!: Answer[];
}
