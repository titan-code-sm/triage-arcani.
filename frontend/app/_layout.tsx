import { QueryClientProvider } from "@tanstack/react-query";
import * as Font from "expo-font";
import { Stack } from "expo-router";
import { LogBox } from "react-native";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { ErrorBoundary } from "@/src/components/error-boundary";
import { queryClient } from "@/src/query-client";

// Disable logbox errors etc so that users can see the app
// and agent works as expected.
LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  // Load custom fonts asynchronously — the UI renders immediately with a
  // system fallback and swaps in Cinzel / Jakarta once ready.
  Font.useFonts({
    Cinzel: require("../assets/fonts/cinzel-v26-latin-regular.ttf"),
    "Cinzel-Bold": require("../assets/fonts/cinzel-v26-latin-700.ttf"),
    Jakarta: require("../assets/fonts/plus-jakarta-sans-v12-latin-regular.ttf"),
    "Jakarta-Medium": require("../assets/fonts/plus-jakarta-sans-v12-latin-500.ttf"),
    "Jakarta-Bold": require("../assets/fonts/plus-jakarta-sans-v12-latin-700.ttf"),
  });

  // One app level ErrorBoundary; a render crash shows a reload screen
  // instead of a blank app.
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <KeyboardProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }} />
        </KeyboardProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
