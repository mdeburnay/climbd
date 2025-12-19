import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import {
	getStravaExpiresAtToken,
	clearStravaTokens,
} from "../utils/stravaAuth";
import { isStravaTokenExpired } from "../utils/stravaHelpers";

export default function App() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);

	const checkAuthStatus = async () => {
		try {
			const expiresAt = await getStravaExpiresAtToken();

			if (expiresAt) {
				const expired = await isStravaTokenExpired(expiresAt);
				if (expired) {
					await clearStravaTokens();
					router.replace("/login");
				} else {
					router.replace("/upload-activity");
				}
			} else {
				router.replace("/login");
			}
		} catch (error) {
			console.error("Error checking auth status:", error);
			router.replace("/login");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		checkAuthStatus();
	}, []);

	if (isLoading) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: "#000",
				}}
			>
				<ActivityIndicator size="large" color="#FFF" />
			</View>
		);
	}

	return null;
}
