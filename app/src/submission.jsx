import {Alert, Image, View, Text, TextInput, Button, ScrollView} from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import {useEffect, useRef, useState} from "react"
import Mapbox, {MapView, Camera, UserLocation} from "@rnmapbox/maps"
import {addDoc} from "firebase/firestore"
import * as FileSystem from "expo-file-system"
import {geohashForLocation} from "geofire-common"
import {firestoreCollection, firebaseStorageRef, useFirebaseUser} from "./lib"

export const Submit = ({navigation, route}) => {
    // TODO: remove map animation
    // TODO: use ImagePicker.getPendingResultAsync
    const [date, setDate] = useState(new Date())
    const [datePicker, setDatePicker] = useState(false)
    const [species, setSpecies] = useState(null)
    const [position, setPosition] = useState()
    const user = useFirebaseUser()

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => <Button title="Submit" onPress={submit} />
        })
    })

    useEffect(() => {
        FileSystem.uploadAsync(
            `${process.env.EXPO_PUBLIC_API_URL}/classify`,
            route.params.asset.uri,
            {
                headers: {
                    "x-api-key": process.env.EXPO_PUBLIC_API_KEY
                },
                httpMethod: "POST",
                fieldName: "image",
                uploadType: FileSystem.FileSystemUploadType.MULTIPART
            }
        )
            .then(res => JSON.parse(res.body))
            .then(body => setSpecies(body.species))
            .catch(error => {
                console.error(error)
                Alert.alert("Try again", "Unable to classify the plant.", [
                    {text: "OK"}
                ])
            })
    }, [])

    const submit = async () => {
        try {
            const doc = await addDoc(firestoreCollection("submissions"), {
                submitter: user.uid,
                species,
                date,
                position,
                geohash: geohashForLocation(position)
            })
            await FileSystem.uploadAsync(
                `${process.env.EXPO_PUBLIC_API_URL}/image/${doc.id}`,
                route.params.asset.uri,
                {
                    headers: {
                        "x-api-key": process.env.EXPO_PUBLIC_API_KEY
                    },
                    httpMethod: "PUT",
                    fieldName: "image",
                    uploadType: FileSystem.FileSystemUploadType.MULTIPART
                }
            )
            Alert.alert("Success", "Your submission has been accepted.", [
                {text: "OK", onPress: () => navigation.navigate("map")}
            ])
        }
        catch (error) {
            console.error(error)
            Alert.alert("Try Again", error.message, [
                {text: "OK"}
            ])
        }
    }

    const datePickerChanged = (event, date) => {
        setDate(date)
        if (event.type == "dismissed" || event.type == "set") {
            setDatePicker(false)
        }
    }

    const updateMap = (event) => {
        setPosition([event.properties.center[1], event.properties.center[0]])
    }

    return (
        <ScrollView>
            <View className="w-full h-full flex flex-col p-5 items-start gap-2">
                <Image className="w-full aspect-square" source={{uri: route.params.asset.uri}} />
                <Text>Species</Text>
                <TextInput className="w-full p-2" onChangeText={setSpecies}>{species}</TextInput>
                <Text>Date</Text>
                <Button title={date.toDateString()} onPress={() => setDatePicker(true)} />
                {datePicker && <DateTimePicker value={date} mode="date" onChange={datePickerChanged} />}
                <Text>Location</Text>
                <View className="w-full aspect-square flex flex-col items-stretch">
                    <MapView style={{flex: 1}} onMapIdle={updateMap}>
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

export const Submission = ({route}) => {
    const submission = route.params.submission

    return (
        <ScrollView>
            <View className="w-full h-full flex flex-col p-5 items-start gap-2">
                <Image className="w-full aspect-square" src={`${process.env.EXPO_PUBLIC_API_URL}/image/${submission.id}`} />
                <Text>Species</Text>
                <Text>{submission.get("species")}</Text>
            </View>
        </ScrollView>
    )
}

