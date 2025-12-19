// Packages
import { SafeAreaView } from "react-native-safe-area-context";
import {
	StyleSheet,
	Keyboard,
	TouchableWithoutFeedback,
	Text,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	View,
	Alert,
} from "react-native";
import { router } from "expo-router";
import { FunctionsHttpError } from "@supabase/supabase-js";

// Components
import { Input } from "../components/Input";
import { Button } from "../components/Button";

// Hooks
import { useEffect, useState } from "react";

// Constants
import { CURRENT_DATE, CURRENT_TIME } from "../constants";

// Utils
import { supabase } from "../utils/supabase";
import { clearStravaTokens, getStravaTokens } from "../utils/stravaAuth";
import { isStravaTokenExpired } from "../utils/stravaHelpers";

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
	const [isUploading, setIsUploading] = useState<boolean>(false);

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

	const setActivityDate = (date: string) => {
		if (date.length > 10) return;
		setDate(date);
	};

	const setActivityDuration = (duration: string) => {
		if (duration.length > 8) return;
		setDuration(duration);
	};

	const setActivityTime = (time: string) => {
		if (time.length > 4) return;
		setTime(time);
	};

	const uploadActivityToSupabase = async (
		activity: Activity,
		accessToken: string
	) => {
		setIsUploading(true);
		try {
			const { error } = await supabase.functions.invoke("upload", {
				headers: {
					"x-strava-access-token": accessToken,
				},
				body: activity,
			});

			if (error && error instanceof FunctionsHttpError) {
				const errorMessage = await error.context.json();
				console.log("Upload activity function returned an error", errorMessage);
				Alert.alert(
					"There was an issue uploading your activity.",
					errorMessage.message
				);
				setIsUploading(false);
				return;
			}

			Alert.alert("Activity uploaded successfully!");
		} catch (e) {
			Alert.alert("There was an issue uploading your activity.");
		} finally {
			setIsUploading(false);
		}
	};

	const generateActivity = () => {
		// Convert date from dd/mm/yyyy to yyyy-mm-dd for ISO 8601 format
		const [day, month, year] = date.split("/");
		const isoDate = `${year}-${month}-${day}`;

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

		return activity;
	};

	const uploadRunToStrava = async () => {
		// check if access token is valid
		const { accessToken, expiresAt } = await getStravaTokens();

		if (!accessToken || !expiresAt) {
			await clearStravaTokens();
			router.navigate("/login");
			return;
		}

		// check if token is expired
		const isExpired = await isStravaTokenExpired(expiresAt);
		if (isExpired) {
			Alert.alert("Token expired", "Please login again");
			await clearStravaTokens();
			router.navigate("/login");
			return;
		}

		const activity = generateActivity();

		await uploadActivityToSupabase(activity, accessToken);
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
							<Text style={styles.title}>Climbd</Text>
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
									onChange={setActivityDuration}
								/>
								<Input
									placeholder="Date (dd/mm/yyyy)"
									value={date}
									onChange={setActivityDate}
								/>
								<Input
									placeholder="Time (hh:mm)"
									value={time}
									onChange={setActivityTime}
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
							<Button
								disabled={isUploading}
								title="Upload"
								onPress={() => uploadRunToStrava()}
							/>
							<Button
								disabled={isUploading}
								title="Reset"
								onPress={() => reset()}
							/>
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
	titleContainer: {
		flexDirection: "row",
		alignItems: "center",
		paddingBottom: 120,
	},
	title: {
		fontSize: 34,
		color: "#FFF",
		textAlign: "center",
		flex: 1,
	},
});
