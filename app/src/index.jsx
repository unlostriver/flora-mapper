import {StatusBar} from "expo-status-bar"
import {View} from "react-native"
import {registerRootComponent} from "expo"
import {NavigationContainer} from "@react-navigation/native"
import {createNativeStackNavigator} from "@react-navigation/native-stack"
import Mapbox from "@rnmapbox/maps"
import Map from "./map"
import SignIn from "./signin"
import "./root.css"

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN)
Mapbox.setTelemetryEnabled(false)

const Stack = createNativeStackNavigator()

const Root = () => {
    return (
        <View className="h-full w-full bg-white">
            <StatusBar style="auto" />
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
                </Stack.Navigator>
            </NavigationContainer>
        </View>
    )
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Root)

