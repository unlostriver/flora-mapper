import {View, Image, LogBox} from "react-native"
import {registerRootComponent} from "expo"
import {NavigationContainer} from "@react-navigation/native"
import {createNativeStackNavigator} from "@react-navigation/native-stack"
import Mapbox from "@rnmapbox/maps"
import {GestureHandlerRootView} from "react-native-gesture-handler"
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context"
import Map from "./map"
import SignIn from "./signin"
import {Submit, Submission} from "./submission"
import "./root.css"

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN)
Mapbox.setTelemetryEnabled(false)
LogBox.ignoreLogs(["ViewTagResolver"])

const Stack = createNativeStackNavigator()

const Root = () => {
    return (
        <SafeAreaProvider>
            <SafeAreaView className="h-full w-full bg-white">
                <GestureHandlerRootView>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName="map">
                            <Stack.Screen
                                name="map"
                                component={Map}
                                options={{title: "Flora Mapper"}}
                            />
                            <Stack.Screen
                                name="signin"
                                component={SignIn}
                                options={{title: "Sign In", presentation: "modal", headerShown: false}}
                            />
                            <Stack.Screen
                                name="submit"
                                component={Submit}
                                options={{title: "Identify Plant"}}
                            />
                            <Stack.Screen
                                name="submission"
                                component={Submission}
                                options={{title: "Sighting"}}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </GestureHandlerRootView>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Root)

