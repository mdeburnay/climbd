// Packages
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Button } from "react-native";

export default function Login() {
	return (
		<SafeAreaView style={{ backgroundColor: "#000", flex: 1 }}>
			<View style={styles.container}>
				<StatusBar style="light" />
				<Button onPress={() => console.log("Login")} title="Login" />
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
