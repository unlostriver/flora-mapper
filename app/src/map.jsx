import {View, Text} from "react-native"
import {useFirebaseUser} from "./firebase"

export default ({navigation}) => {
    const user = useFirebaseUser(user => {
        if (!user) {
            navigation.navigate("signin")
        }
    })

    return (
        <View>
            <Text>map</Text>
        </View>
    )
}

