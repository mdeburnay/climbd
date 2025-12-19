// Packages
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
	StyleSheet,
	Keyboard,
	TouchableWithoutFeedback,
	Pressable,
	Text,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { FunctionsHttpError } from "@supabase/supabase-js";

// Components
import { Input } from "../components/Input";

// Hooks
import { useEffect, useState } from "react";

// Constants
import { CURRENT_DATE, CURRENT_TIME } from "../constants";

// Utils
import { supabase } from "../utils/supabase";

type Activity = {
	name: string;
	type: string;
	start_date_local: string;
	elapsed_time: number;
	description: string;
	distance: number;
	trainer: number;
	commute: number;
	total_elevation_gain: number;
};

export default function UploadActivity() {
	// State
	const [distance, setDistance] = useState<string>("");
	const [incline, setIncline] = useState<string>("");
	const [elevation, setElevation] = useState<string>("");
	const [duration, setDuration] = useState<string>("");
	const [date, setDate] = useState<string>(CURRENT_DATE);
	const [time, setTime] = useState<string>(CURRENT_TIME);
	const [title, setTitle] = useState<string>("");

	// Calculate metres climbed when distance or incline changes
	useEffect(() => {
		if (distance && incline) {
			const elevationGain = Number(distance) * Number(incline) * 10; // Convert km and % to meters
			setElevation(elevationGain.toString());
		}
	}, [distance, incline]);

	const reset = () => {
		setDistance("");
		setIncline("");
		setElevation("");
		setDuration("");
		setDate(CURRENT_DATE);
		setTime(CURRENT_TIME);
		setTitle("");
	};

	const uploadRunToStrava = async () => {
		// check if access token is valid
		const accessToken = await AsyncStorage.getItem("strava_access_token");
		if (!accessToken) {
			router.navigate("/login");
		}

		const expiresAt = await AsyncStorage.getItem("strava_expires_at");
		const currentTime = Date.now() / 1000;
		if (parseInt(expiresAt) < currentTime) {
			await AsyncStorage.removeItem("strava_access_token");
			await AsyncStorage.removeItem("strava_expires_at");
			router.navigate("/login");
		}

		// Convert date from dd/mm/yyyy to yyyy-mm-dd for ISO 8601 format
		const [day, month, year] = date.split("/");
		const isoDate = `${year}-${month}-${day}`;

		// create activity
		const activity: Activity = {
			name: title,
			type: "Run",
			distance: Number(distance) * 1000,
			elapsed_time: duration
				.split(":")
				.reduce((acc, curr) => acc * 60 + Number(curr), 0),
			description: "Test activity",
			trainer: 1,
			commute: 0,
			start_date_local: `${isoDate}T${time}:00.000Z`,
			total_elevation_gain: Number(elevation),
		};

		// upload activity
		const { data, error } = await supabase.functions.invoke("upload", {
			headers: {
				"x-strava-access-token": accessToken,
			},
			body: activity,
		});

		if (error && error instanceof FunctionsHttpError) {
			const errorMessage = await error.context.json();
			console.log("Upload activity function returned an error", errorMessage);
			return;
		}
	};

	return (
		<SafeAreaView style={{ backgroundColor: "#000", flex: 1 }}>
			<View style={styles.container}>
				<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
					<KeyboardAvoidingView
						keyboardVerticalOffset={Platform.OS === "android" ? -500 : 0}
					>
						<View style={styles.titleContainer}>
							<View style={{ flex: 1 }} />
							<Text style={[styles.title, { flex: 1 }]}>Climbd</Text>
						</View>

						<ScrollView
							contentContainerStyle={styles.container}
							scrollEnabled={false}
						>
							<View style={styles.inputContainer}>
								<Input
									placeholder="Title (e.g. My Morning Run)"
									value={title}
									onChange={setTitle}
								/>
								<Input
									placeholder="Distance (km)"
									value={distance}
									onChange={setDistance}
								/>
								<Input
									placeholder="Duration (hh:mm:ss)"
									value={duration}
									onChange={setDuration}
								/>
								<Input
									placeholder="Date (dd/mm/yyyy)"
									value={date}
									onChange={setDate}
								/>
								<Input
									placeholder="Time (hh:mm)"
									value={time}
									onChange={setTime}
								/>
								<Input
									placeholder="Incline (%)"
									value={incline}
									onChange={setIncline}
								/>
								<Input
									placeholder="Elevation (m)"
									value={elevation}
									onChange={setElevation}
								/>
							</View>
							<Button title="Upload" onPress={() => uploadRunToStrava()} />
							<Button title="Reset" onPress={() => reset()} />
							<StatusBar style="light" />
						</ScrollView>
					</KeyboardAvoidingView>
				</TouchableWithoutFeedback>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 30,
	},
	inputContainer: {
		paddingBottom: 140,
	},
	button: {
		padding: 10,
	},
	titleContainer: {
		flexDirection: "row",
		alignItems: "center",
		paddingBottom: 120,
	},
	title: {
		fontSize: 34,
		color: "#FFF",
		textAlign: "center",
	},
	text: {
		fontSize: 20,
		color: "#FFF",
	},
});

const Button = ({ onPress, title }) => {
	return (
		<Pressable style={styles.button} onPress={onPress}>
			<Text
				style={[
					styles.text,
					{ textAlign: "center", textTransform: "uppercase" },
				]}
			>
				{title}
			</Text>
		</Pressable>
	);
};
