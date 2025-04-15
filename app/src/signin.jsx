import {useState} from "react"
import {View, Text, TextInput, Button, Alert} from "react-native"
import {firebasePasswordSignIn} from "./firebase"

export default ({navigation}) => {
    const [email, setEmail] = useState()
    const [password, setPassword] = useState()

    const submit = () => {
        firebasePasswordSignIn(email, password)
            .then(() => {
                navigation.navigate("map")
            })
            .catch((error) => {
                Alert.alert("Try again", error.message, [
                    {text: "OK"}
                ])
            })
    }

    return (
        <View className="w-full h-full flex flex-col items-stretch justify-center p-10 gap-5">
            <Text className="text-5xl">Sign In</Text>
            <TextInput
                className="border bg-gray-100 p-5"
                placeholder="Email"
                inputMode="email"
                onChangeText={setEmail}
            />
            <TextInput
                className="border bg-gray-100 p-5"
                placeholder="Password"
                secureTextEntry={true}
                onChangeText={setPassword}
            />
            <Button
                title="Sign In"
                onPress={submit}
            />
        </View>
    )
}

