import React, {useState} from 'react'
import {View, Text, Image, TextInput, TouchableOpacity, Alert} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {icons} from "../../constants";
import {Link, router} from "expo-router";
import {signInWithEmailAndPassword} from "firebase/auth"
import {collection, query, where, getDocs} from "firebase/firestore"
import {auth, db} from "../../utility/firebaseConfig"
import Loader from "../../components/Loader";
import {useGlobalStore} from "../../context/globalStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = () => {
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm]= useState({phone: "", password: ""})

    const {setUser} = useGlobalStore()


    async function handleLogin() {
        if (!form.phone || !form.password) {
            Alert.alert('Error', 'Please fill all the fields');
            return;
        }

        if (!/^\d{9}$/.test(form.phone)) {
            Alert.alert('Error', 'Please enter a valid 9 digit account number');
            return;
        }


        try {
            setLoading(true);
            const q = query(collection(db, "users"), where("accountNumber", "==", form.phone));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                throw new Error('No user found with this account number');
            }
            const userDoc = querySnapshot.docs[0];

            const email = userDoc.data().email;

            // Log in with email and password
            const credential = await signInWithEmailAndPassword(auth, email, form.password);
            const user = auth.currentUser;
            if (user.emailVerified) {
                //console.log(result)
                setUser(credential.user)
                await AsyncStorage.setItem('userAuth', JSON.stringify(credential.user))
                router.replace('/Home');
            } else {
                Alert.alert('Error', 'Email not verified. Please check your inbox.');
            }

        } catch (error) {
            handleAuthError(error);
        } finally {
            setLoading(false);
        }
    }

    const handleAuthError = (error) => {
        switch (error.code) {
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
                Alert.alert("Error", "Invalid password");
                break;
            case 'auth/user-disabled':
                Alert.alert("Error", "Your account has been disabled");
                break;
            case 'auth/too-many-requests':
                Alert.alert("Error", "Your account has been temporarily disabled. Too many login attempts");
                break;
            default:
                Alert.alert("Error", error.message);
        }
    };

    return (
        <SafeAreaView className="bg-primary h-full w-full justify-center px-3">
            {loading &&
                <Loader/>
            }

            {/* Logo Section */}
            <View className="w-full justify-center items-center mb-8">
                <Image
                    className="w-24 h-24 mb-4"
                    resizeMode="contain"
                    source={require("../../assets/logo/bankify_logo.png")}
                />
            </View>

            <View className="w-full justify-center items-center mt-7">
                <Text className="text-2xl font-pbold" style={{color: '#0066FF'}}>Welcome</Text>
                <Text className="text-gray-200 text-lg">Login to get started</Text>
            </View>

            <View
                className=" mt-6 rounded-3xl border-2 border-[#E7E7E7] flex-row items-center w-full h-[56px] px-4">
                <Image
                    className="w-6 h-6 "
                    source={icons.phone}
                    resizeMode="contain"
                />
                <TextInput
                    onChangeText={(e)=>setForm({...form, phone: e})}
                    className="flex-1 font-pmedium ml-2"
                    placeholder="Account number"
                    keyboardType="numeric"
                    maxLength={9}
                />
            </View>

            <View className="mt-6 rounded-3xl border-2 border-[#E7E7E7] flex-row items-center w-full h-[56px] px-4">
                <Image className="w-6 h-6" source={icons.lock} resizeMode="contain"/>
                <TextInput
                    onChangeText={(e)=>setForm({...form, password: e})}
                    className="flex-1 font-pmedium ml-2"
                    placeholder="Password"
                    keyboardType="default"
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Image
                        source={!showPassword ? icons.eye : icons.eyeHide}
                        className="w-6 h-6"
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={handleLogin}
                className="mt-5 flex-row p-3 rounded-full items-center justify-center"
                style={{backgroundColor: '#0066FF'}}
            >
                <Text className="ml-3 text-lg text-white items-center justify-center">Login</Text>
            </TouchableOpacity>

            <View className="w-full justify-end items-center pt-3 flex-row">
                <Text className="font-pregular text-gray-200">Don't have an account? </Text>
                <Link href="/Register" className="text-lg mx-2" style={{color: '#0066FF'}}>Register</Link>
            </View>
        </SafeAreaView>
    )
}
export default Login