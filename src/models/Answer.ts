import {
	AutoIncrement,
	BelongsTo,
	Column,
	DataType,
	ForeignKey,
	Model,
	PrimaryKey,
	Table
} from 'sequelize-typescript';
import Question from './Question';
import User from './User';

@Table
export default class Answer extends Model<Answer> {
	@PrimaryKey
	@AutoIncrement
	@Column
	id!: number;

	// If it's an image submission, this is a URL
	@Column(DataType.TEXT)
	content!: string;

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
}
