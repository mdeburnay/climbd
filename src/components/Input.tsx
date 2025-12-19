import { TextInput, StyleSheet } from "react-native";

interface IInput {
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
}

export const Input = ({ placeholder, value, onChange }: IInput) => {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#7e7e7e"
      onChangeText={onChange}
      value={value}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    fontSize: 28,
    color: "#FFF",
    height: 50,
  },
});
