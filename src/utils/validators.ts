export function isNonEmptyString(obj: any): obj is string {
	return typeof obj === 'string' && obj.length > 0;
}

// No way to restrict the generic to enums only, oh well
export function isStringEnumMember<T>(enumObj: T, obj: any): obj is T[keyof T] {
	return Object.values(enumObj).includes(obj);
}
