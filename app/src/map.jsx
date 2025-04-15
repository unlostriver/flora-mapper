import {View, Alert} from "react-native"
import {MapView, Camera, VectorSource, FillExtrusionLayer, UserLocation} from "@rnmapbox/maps"
import {useState} from "react"
import {geohashQueryBounds} from "geofire-common"
import {firestoreCollection, useFirebaseUser} from "./lib"
import {endAt, getDocs, orderBy, startAt, query} from "firebase/firestore"
import MapSheet from "./map-sheet"

export default ({navigation}) => {
    const [coordinates, setCoordinates] = useState()
    const [submissions, setSubmissions] = useState()

    useFirebaseUser(user => {
        if (!user) {
            navigation.navigate("signin")
        }
    })

    const refreshSubmissions = (coordinates, radius) => {
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
        Promise.all(promises)
            .then(snapshots => {
                const matchingDocs = []
                for (const snap of snapshots) {
                    for (const doc of snap.docs) {
                        const submissionCoordinates = doc.get("coordinates")
                        const distanceInKm = geofire.distanceBetween(submissionCoordinates, coordinates)
                        const distanceInM = distanceInKm * 1000
                        if (distanceInM <= radius) {
                            matchingDocs.push(doc);
                        }
                    }
                }
                setSubmissions(matchingDocs)
            })
            .catch(error => {
                console.error(error)
                Alert.alert("Try again", error.message, [
                    {text: "OK"}
                ])
            })
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
            </MapView>
            <MapSheet navigation={navigation} />
        </View>
    )
}

