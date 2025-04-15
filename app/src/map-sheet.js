import BottomSheet, {BottomSheetView} from "@gorhom/bottom-sheet"
import {useRef} from "react"
import { Button } from "react-native"
import {View, TextInput} from "react-native"
import * as ImagePicker from "expo-image-picker"

export default ({navigation}) => {
    const sheetRef = useRef(null)

    const camera = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync()
        if (permission.granted) {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ["images"],
                allowsMultipleSelection: false,
                allowsEditing: true,
                quality: 1
            })
            if (result.canceled) {
                return null
            }
            return result.assets[0]
        }
        return null
    }

    const cameraRoll = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsMultipleSelection: false,
            allowsEditing: true,
            quality: 1
        })
        if (result.canceled) {
            return null
        }
        return result.assets[0]
    }

    const submit = async asset => {
        asset = await asset
        if (asset) {
            navigation.navigate("submission", {asset})
        }
    }

    return (
        <BottomSheet ref={sheetRef}>
            <BottomSheetView className="flex flex-col items-stretch p-5">
                <View className="flex flex-row gap-5">
                    <TextInput
                        className="rounded-full border bg-gray-100 p-2 flex-1"
                        placeholder="Search"
                    />
                    <Button title="Camera" onPress={() => submit(camera())} />
                    <Button title="Photos" onPress={() => submit(cameraRoll())} />
                </View>
            </BottomSheetView>
        </BottomSheet>
    )
}

