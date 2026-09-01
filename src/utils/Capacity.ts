/** Returns the first doubled capacity able to contain the requested size. */
export function nextPowerOfTwoCapacity(
	required: number,
	minimumCapacity: number,
): number {
	let capacity = minimumCapacity;
	while (capacity < required) capacity *= 2;
	return capacity;
}
