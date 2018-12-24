import {
	AutoIncrement, BelongsTo,
	Column,
	DataType,
	ForeignKey,
	HasMany,
	Model,
	PrimaryKey,
	Table
} from 'sequelize-typescript';
import Answer from './Answer';
import Unit from './Unit';

export enum QuestionType {
	SCIENCE = 'science',
	TECHNOLOGY = 'technology',
	ENGINEERING = 'engineering',
	MATHEMATICS = 'mathematics'
}

export enum AnswerFormat {
	TEXT = 'text',
	IMAGE = 'image',
	NUMERICAL = 'numerical'
}

@Table
export default class Question extends Model<Question> {
	@PrimaryKey
	@AutoIncrement
	@Column
	id!: number;

	@Column(DataType.TEXT)
	body!: string;

	@Column(DataType.ENUM(Object.values(QuestionType)))
	questionType!: QuestionType;

	@Column(DataType.ENUM(Object.values(AnswerFormat)))
	answerFormat!: AnswerFormat;

	@ForeignKey(() => Unit)
	@Column
	unitId!: number;

	@BelongsTo(() => Unit)
	unit!: Unit;

	// Only present on math/numerical questions
	@Column(DataType.DOUBLE)
	correctAnswer!: number | null;

	@Column
	maxPoints!: number;

	@HasMany(() => Answer)
	answers!: Answer[];
}
