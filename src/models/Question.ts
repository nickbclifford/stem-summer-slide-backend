import { AutoIncrement, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

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

	// Only present on math/numerical questions
	@Column
	answer!: number | null;
}
