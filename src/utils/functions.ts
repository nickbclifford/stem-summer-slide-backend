export function pickProps<T, K extends keyof T>(obj: T, keys: K[]) {
	const newObj: Partial<Pick<T, K>> = {};

	for (const key of keys) {
		newObj[key] = obj[key];
	}

	return newObj as Pick<T, K>;
}
