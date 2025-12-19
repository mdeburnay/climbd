// Packages
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Button, Alert } from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { FunctionsHttpError } from "@supabase/supabase-js";

// Constants
import { CLIENT_ID } from "../constants";

// Utils
import { supabase } from "../utils/supabase";
import { setStravaTokens } from "../utils/stravaAuth";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
	const router = useRouter();
	const redirectUri = AuthSession.makeRedirectUri({
		// scheme: "com.climbd",
		// path: "redirect",
		native: "com.climbd",
	});

	const [request, response, promptAsync] = AuthSession.useAuthRequest(
		{
			clientId: CLIENT_ID,
			redirectUri: redirectUri,
			scopes: ["activity:write"],
			responseType: AuthSession.ResponseType.Code,

			extraParams: {
				approval_prompt: "force",
			},
		},
		{
			authorizationEndpoint: "https://www.strava.com/oauth/authorize",
		}
	);

	const handleStravaAuth = async (code: string) => {
		try {
			const { data, error } = await supabase.functions.invoke("auth", {
				body: { code, redirectUri },
			});

			if (error && error instanceof FunctionsHttpError) {
				const errorMessage = await error.context.json();
				console.log("Function returned an error", errorMessage);
				return;
			}

			// save data in async storage
			await setStravaTokens(
				data.access_token,
				data.refresh_token,
				data.expires_at.toString()
			);

			// redirect to upload activity screen on success
			router.navigate("/upload-activity");
		} catch (error: any) {
			console.log(error);
			Alert.alert(
				"Error",
				error.message || "Failed to complete authentication"
			);
		}
	};

	useEffect(() => {
		if (response?.type === "success") {
			const { code } = response.params;

			if (code) {
				handleStravaAuth(code);
			}
		} else if (response?.type === "error") {
			Alert.alert(
				"Failed to login to Climbd",
				response.error?.message || "Failed to login to Climbd"
			);
		}
	}, [response]);

	return (
		<SafeAreaView style={{ backgroundColor: "#000", flex: 1 }}>
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<Button
					onPress={() => promptAsync()}
					title="Login"
					disabled={!request}
				/>
			</View>
		</SafeAreaView>
	);
}
