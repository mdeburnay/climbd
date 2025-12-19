import AsyncStorage from "@react-native-async-storage/async-storage";

/*********************
 * Single Operations *
 *********************/
export const getStravaExpiresAtToken = async () => {
	const expiresAt = await AsyncStorage.getItem("strava_expires_at");
	return expiresAt;
};

/*******************
 * Bulk Operations *
 *******************/
export const getStravaTokens = async () => {
	const accessToken = await AsyncStorage.getItem("strava_access_token");
	const refreshToken = await AsyncStorage.getItem("strava_refresh_token");
	const expiresAt = await AsyncStorage.getItem("strava_expires_at");
	return { accessToken, refreshToken, expiresAt };
};

export const setStravaTokens = async (
	accessToken: string,
	refreshToken: string,
	expiresAt: string
) => {
	await AsyncStorage.setItem("strava_access_token", accessToken);
	await AsyncStorage.setItem("strava_refresh_token", refreshToken);
	await AsyncStorage.setItem("strava_expires_at", expiresAt);
};

export const clearStravaTokens = async () => {
	await AsyncStorage.removeItem("strava_access_token");
	await AsyncStorage.removeItem("strava_refresh_token");
	await AsyncStorage.removeItem("strava_expires_at");
};
