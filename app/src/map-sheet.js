import BottomSheet, {BottomSheetView} from "@gorhom/bottom-sheet"
import {useRef} from "react"
import { Button } from "react-native"
import {View, TextInput} from "react-native"

export default (props) => {
    const sheetRef = useRef(null)

    const sheetChanged = (index) => console.debug("sheet ", index)

    return (
        <BottomSheet ref={sheetRef} onChange={sheetChanged}>
            <BottomSheetView className="flex flex-col items-stretch p-5">
                <View className="flex flex-row gap-5">
                    <TextInput
                        className="rounded-full border bg-gray-100 p-2 flex-1"
                        placeholder="Search"
                    />
                    <Button title="Camera" />
                    <Button title="Photos" />
                </View>
            </BottomSheetView>
        </BottomSheet>
    )
}

