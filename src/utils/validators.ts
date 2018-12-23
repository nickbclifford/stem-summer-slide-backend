export function isNonEmptyString(obj: any): obj is string {
	return typeof obj === 'string' && obj.length > 0;
}
