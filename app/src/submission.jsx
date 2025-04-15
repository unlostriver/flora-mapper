import {Image, View, Text, TextInput, Button, ScrollView} from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import {useEffect, useState} from "react"
import {MapView, Camera, UserLocation} from "@rnmapbox/maps"

export default ({navigation, route}) => {
    // TODO: use ImagePicker.getPendingResultAsync
    const [date, setDate] = useState(new Date())
    const [datePicker, setDatePicker] = useState(false)

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => <Button title="Submit" onPress={submit} />
        })
    }, [])

    const submit = () => {
    }

    const datePickerChanged = (event, date) => {
        setDate(date)
        if (event.type == "dismissed" || event.type == "set") {
            setDatePicker(false)
        }
    }

    return (
        <ScrollView>
            <View className="w-full h-full flex flex-col p-5 items-start gap-2">
                <Image className="w-full aspect-square" source={{uri: route.params.asset.uri}} />
                <Text>Species</Text>
                <TextInput className="w-full p-2" />
                <Text>Date</Text>
                <Button title={date.toDateString()} onPress={() => setDatePicker(true)} />
                {datePicker && <DateTimePicker value={date} mode="date" onChange={datePickerChanged} />}
                <Text>Location</Text>
                <View className="w-full aspect-square flex flex-col items-stretch">
                    <MapView style={{flex: 1}}>
                        <Camera
                            zoomLevel={15}
                            followZoomLevel={15}
                            followUserLocation={true}
                        />
                        <UserLocation
                            visible={true}
                            showsUserHeadingIndicator={true}
                        />
                    </MapView>
                </View>
            </View>
        </ScrollView>
    )
}

