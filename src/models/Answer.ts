import {
	AutoIncrement,
	BelongsTo,
	Column, CreatedAt,
	DataType,
	ForeignKey,
	Model,
	PrimaryKey,
	Table
} from 'sequelize-typescript';
import Question from './Question';
import User from './User';

@Table({ updatedAt: false })
export default class Answer extends Model<Answer> {
	@PrimaryKey
	@AutoIncrement
	@Column
	id!: number;

	// If it's an image submission, this is a space-delimited list of URLs
	@Column(DataType.TEXT)
	content!: string;

	// Null if not graded yet
	@Column(DataType.FLOAT)
	points!: number | null;

	@ForeignKey(() => User)
	@Column
	userId!: number;

	@BelongsTo(() => User)
	user!: User;

	@ForeignKey(() => Question)
	@Column
	questionId!: number;

	@BelongsTo(() => Question)
	question!: Question;

	@CreatedAt
	submittedAt!: Date;
}
