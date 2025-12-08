// Packages
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Button, Alert } from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";

// Constants
import { CLIENT_ID } from "../constants";

// Utils
import { supabase } from "../utils/supabase";
import { FunctionsHttpError } from "@supabase/supabase-js";

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
	const redirectUri = AuthSession.makeRedirectUri({
		// scheme: "com.climbd",
		// path: "redirect",
		native: "com.climbd",
	});

	const [request, response, promptAsync] = AuthSession.useAuthRequest(
		{
			clientId: CLIENT_ID,
			redirectUri: redirectUri,
			scopes: ["activity:read_all"],
			responseType: AuthSession.ResponseType.Code,

			extraParams: {
				approval_prompt: "force",
			},
		},
		{
			authorizationEndpoint: "https://www.strava.com/oauth/authorize",
		}
	);

	useEffect(() => {
		if (response?.type === "success") {
			const { code } = response.params;

			if (code) {
				console.log("Code:", code);
				handleStravaAuth(code);
			}
		} else if (response?.type === "error") {
			Alert.alert(
				"Authentication Error",
				response.error?.message || "Failed to authenticate with Strava"
			);
		}
	}, [response]);

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

			console.log("Data:", data);
		} catch (error: any) {
			console.log(error);
			Alert.alert(
				"Error",
				error.message || "Failed to complete authentication"
			);
		}
	};

	return (
		<SafeAreaView style={{ backgroundColor: "#000", flex: 1 }}>
			<View style={styles.container}>
				<StatusBar style="light" />
				<Button
					onPress={() => promptAsync()}
					title="Login with Strava"
					disabled={!request}
				/>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	title: {
		fontSize: 24,
		color: "#FFF",
	},
});
