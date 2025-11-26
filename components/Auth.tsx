import { Text, StyleSheet } from "react-native";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "../utils/supabase";
import { useEffect } from "react";

// const performOAuth = async () => {
//   const { data, error } = await supabase.auth.signInWithOAuth({
//     provider: "strava",
//     options: {
//       redirectTo,
//       skipBrowserRedirect: true,
//     },
//   });
//   if (error) throw error;

//   const res = await WebBrowser.openAuthSessionAsync(
//     data?.url ?? "",
//     redirectTo
//   );

//   if (res.type === "success") {
//     const { url } = res;
//     await createSessionFromUrl(url);
//   }
// };

export default function Auth() {
	const CLIENT_ID = process.env.EXPO_PUBLIC_CLIENT_ID;
	const REDIRECT_URL = process.env.EXPO_PUBLIC_REDIRECT_URL;

	WebBrowser.maybeCompleteAuthSession(); // required for web only
	const redirectTo = makeRedirectUri();

	// Endpoint
	const discovery = {
		authorizationEndpoint: "https://www.strava.com/oauth/mobile/authorize",
		tokenEndpoint: "https://www.strava.com/oauth/token",
		revocationEndpoint: "https://www.strava.com/oauth/deauthorize",
	};

	const createSessionFromUrl = async (url: string) => {
		const { params, errorCode } = QueryParams.getQueryParams(url);

		if (errorCode) throw new Error(errorCode);
		const { access_token, refresh_token } = params;

		if (!access_token) return;

		const { data, error } = await supabase.auth.setSession({
			access_token,
			refresh_token,
		});
		if (error) throw error;
		return data.session;
	};

	const [request, response, promptAsync] = useAuthRequest(
		{
			clientId: CLIENT_ID,
			scopes: ["activity:read_all"],
			redirectUri: REDIRECT_URL,
		},
		discovery
	);
	// Handle linking into app from email app.
	const url = Linking.useLinkingURL();
	if (url) createSessionFromUrl(url);

	useEffect(() => {
		if (response?.type === "success") {
			const { code } = response.params;
		}
	}, [response]);

	return (
		<Text onPress={() => promptAsync()} style={[styles.login, { flex: 1 }]}>
			Login
		</Text>
	);
}

const styles = StyleSheet.create({
	login: {
		fontSize: 20,
		color: "#FFF",
		textAlign: "center",
		textTransform: "uppercase",
	},
});
