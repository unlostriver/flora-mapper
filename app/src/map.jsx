import {View, Alert, Image, Text} from "react-native"
import {MapView, Camera, VectorSource, FillExtrusionLayer, UserLocation, PointAnnotation} from "@rnmapbox/maps"
import {useEffect, useState} from "react"
import {geohashQueryBounds, distanceBetween} from "geofire-common"
import {firebaseStorageRef, firestoreCollection, useFirebaseUser} from "./lib"
import {endAt, getDocs, orderBy, startAt, query} from "firebase/firestore"
import * as Location from "expo-location"
import {getDownloadURL} from "firebase/storage"
import MapSheet from "./map-sheet"

export default ({navigation}) => {
    const [coordinates, setCoordinates] = useState()
    const [submissions, setSubmissions] = useState([])

    useFirebaseUser(user => {
        if (!user) {
            navigation.navigate("signin")
        }
    })

    useEffect(() => {
        Location.requestForegroundPermissionsAsync()
    }, [])

    const refreshSubmissions = async (coordinates, radius) => {
        const bounds = geohashQueryBounds(coordinates, radius)
        const promises = []
        for (const b of bounds) {
            const q = query(
                firestoreCollection("submissions"),
                orderBy("geohash"),
                startAt(b[0]),
                endAt(b[1])
            )
            promises.push(getDocs(q))
        }
        try {
            const snapshots = await Promise.all(promises)
            const matchingDocs = []
            for (const snap of snapshots) {
                for (const doc of snap.docs) {
                    const submissionCoordinates = doc.get("position")
                    const distanceInKm = distanceBetween(submissionCoordinates, coordinates)
                    const distanceInM = distanceInKm * 1000
                    if (distanceInM <= radius) {
                        matchingDocs.push(doc)
                    }
                }
            }
            setSubmissions(matchingDocs)
        }
        catch (error) {
            console.error(error)
            Alert.alert("Try again", error.message, [
                {text: "OK"}
            ])
        }
    }

    const updateMap = (event) => {
        const newCoordinates = [event.properties.center[1], event.properties.center[0]]
        if (coordinates && (
            Math.abs(newCoordinates[0] - coordinates[0]) < 3e-4 ||
            Math.abs(newCoordinates[1] - coordinates[1]) < 3e-4
        )) {
            return
        }
        setCoordinates(newCoordinates)
        refreshSubmissions(newCoordinates, 1000)
    }

    const newMarker = submission => {
        const showDetails = () => {
            navigation.navigate("submission", {submission})
        }

        return (
            <PointAnnotation
                key={submission.id}
                id={submission.id}
                coordinate={[submission.get("position")[1], submission.get("position")[0]]}
                title={submission.get("species")}
                onSelected={showDetails}
            />
        )
    }

    return (
        <View className="w-full h-full flex flex-col items-stretch">
            <MapView
                style={{flex: 1}}  // flex-1 in className doesn't work.
                compassEnabled={true}
                onMapIdle={updateMap}
            >
                <Camera
                    zoomLevel={15}
                    followZoomLevel={15}
                    centerCoordinate={[-79.3832, 43.6532]}
                    followUserLocation={true}
                />
                <VectorSource id="composite" url="mapbox://mapbox.mapbox-streets-v8">
                    <FillExtrusionLayer
                        id="3d-buildings"
                        sourceLayerID="building"
                        filter={["==", "extrude", "true"]}
                        style={{
                            fillExtrusionColor: "#fff",
                            fillExtrusionHeight: ["get", "height"],
                            fillExtrusionBase: ["get", "min_height"],
                            fillExtrusionOpacity: 0.8,
                        }}
                        belowLayerID="road-label"
                    />
                </VectorSource>
                <UserLocation
                    visible={true}
                    showsUserHeadingIndicator={true}
                />
                {submissions.map(newMarker)}
            </MapView>
            <MapSheet navigation={navigation} />
        </View>
    )
}

