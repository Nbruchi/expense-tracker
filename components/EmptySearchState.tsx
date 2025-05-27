import { Text, View } from "react-native";

interface EmptySearchStateProps {
  searchQuery: string;
}

export const EmptySearchState = ({ searchQuery }: EmptySearchStateProps) => (
  <View className="flex-1 items-center justify-center px-4">
    <Text className="text-gray-500 text-center text-lg">
      No expenses matching &ldquo;{searchQuery}&rdquo; found
    </Text>
  </View>
);
