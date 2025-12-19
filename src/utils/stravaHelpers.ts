export const isStravaTokenExpired = async (
	expiresAt: string
): Promise<boolean> => {
	const expiresAtNumber = parseInt(expiresAt);
	const currentTime = Date.now() / 1000;
	return expiresAtNumber < currentTime;
};
