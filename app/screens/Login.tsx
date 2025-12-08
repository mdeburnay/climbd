// Packages
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Button } from "react-native";

// Constants
import { CLIENT_ID } from "../constants";

export default function Login() {
	return (
		<SafeAreaView style={{ backgroundColor: "#000", flex: 1 }}>
			<View style={styles.container}>
				<StatusBar style="light" />
				<Button
					onPress={() =>
						console.log(
							`https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=http://localhost:8081/exchange_token&approval_prompt=force&scope=activity:read_all`
						)
					}
					title="Login"
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
