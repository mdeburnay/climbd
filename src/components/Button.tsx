import { Pressable, StyleSheet, Text } from "react-native";

interface IButton {
	onPress: () => void;
	title: string;
	disabled?: boolean;
}

export const Button = ({ onPress, title, disabled }: IButton) => {
	return (
		<Pressable disabled={disabled} style={styles.button} onPress={onPress}>
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

const styles = StyleSheet.create({
	button: {
		padding: 10,
	},
	text: {
		fontSize: 20,
		color: "#FFF",
	},
});
