import React, {useState} from "react";
import {Image, ScrollView, Text, TextInput, TouchableOpacity, View, Platform, Alert} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {icons} from "../../constants";
import DateTimePicker from "@react-native-community/datetimepicker";
import Checkbox from "expo-checkbox"
import {Link, router} from "expo-router";
import {createUserWithEmailAndPassword, sendEmailVerification, updateProfile} from "firebase/auth"
import {collection, query, where, getDocs, doc, setDoc} from "firebase/firestore"
import {auth, db} from "../../utility/firebaseConfig"
import Loader from "../../components/Loader";


const Register = () => {
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false);
    const [showDateOfBirth, setShowDateOfBirth] = useState(false);
    const [date, setDate] = useState(new Date());
    const [checked, setChecked] = useState(false);
    const [form, setForm] = useState({
        phone: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        terms: checked
    })

    //terms and condition
    const ToggleTerms = () => {
        const newChecked = !checked
        setChecked(newChecked)
        setForm({...form, terms: newChecked})
    }

    //Date picker
    const onchange = (event, selectedDate) => {
        const currentDate = selectedDate || date
        setShowDateOfBirth(Platform.OS === "ios")
        setDate(currentDate)
        setForm({...form, dateOfBirth: currentDate.toLocaleDateString()})
    }

    const SendOTP = async () => {
        try {
            const user = auth.currentUser
            await sendEmailVerification(user)
            Alert.alert('Success', 'Email verification link sent!')
        } catch (error) {
            console.log(error)
        }
    }

    async function handleSubmit() {

        if (!form.email || !form.password || !form.phone || !form.firstName || !form.lastName || !form.dateOfBirth) {
            Alert.alert('Error', 'Please fill in all fields')
            return
        }

        const phoneRegex = /^\+[1-9]\d{1,3}\d{8,14}$/;
        if (!phoneRegex.test(form.phone)) {
            Alert.alert('Error', 'Please enter a valid phone number including the country code')
            return
        }

        //get bank account number from phone number
        const accountNumber = form.phone.slice(4, form.phone.length)

        //handle phone number format here


        try {
            setLoading(true)
            //Check for unique phone number
            const usersCollection = collection(db, 'users')
            const q = query(usersCollection, where("displayName", "==", form.phone))
            const querySnapshot = await getDocs(q)

            if (!querySnapshot.empty) {
                Alert.alert('Error', 'Phone number already exist')
                return
            }
            //Creat user with email and password
            const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)

            //update user profile with phone number
            await updateProfile(cred.user, {displayName: form.phone})

            //Create user document in firestore
            const userDocRef = doc(usersCollection, cred.user.uid)
            const docData = {
                displayName: form.phone,
                email: form.email,
                firstName: form.firstName,
                lastName: form.lastName,
                accountNumber: accountNumber,
                dateOfBirth: form.dateOfBirth,
                accountBalance: 1000,
                transactions: [],
            }
            await setDoc(userDocRef, docData)

            //send verification link
            SendOTP()
            //Navigate to OTP screen
            router.push("/EmailOTP")
        } catch (error) {
            console.log(error.message)
            if(error.code === 'auth/email-already-in-use'){
                Alert.alert('Error', 'Email already used')
            }

        } finally {
            setLoading(false)
        }

    }

    return (
        <SafeAreaView className="bg-primary h-full w-full justify-center ">
            {loading &&
                <Loader/>
            }
            
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="mx-2 mb-2"
                contentContainerStyle={{minHeight: "100%", justifyContent: "center"}}
            >
                {/* Logo Section */}
                <View className="w-full justify-center items-center mb-6">
                    <Image
                        className="w-24 h-24 mb-4"
                        resizeMode="contain"
                        source={require("../../assets/logo/bankify_logo.png")}
                    />
                </View>

                <View className="w-full justify-center items-center mt-7">
                    <Text className="text-2xl font-pbold" style={{color: '#0066FF'}}>Welcome</Text>
                    <Text className="text-gray-200 text-lg">Register to get started</Text>
                </View>

                <View
                    className=" mt-6 rounded-3xl border-2 border-[#E7E7E7] flex-row items-center w-full h-[56px] px-4">
                    <Image
                        className="w-6 h-6 "
                        source={icons.phone}
                        resizeMode="contain"
                    />
                    <TextInput
                        onChangeText={(e) => setForm({...form, phone: e})}
                        className="flex-1 font-pmedium ml-2"
                        placeholder="Phone number"
                    />
                </View>

                <View
                    className=" mt-6 rounded-3xl border-2 border-[#E7E7E7] flex-row items-center w-full h-[56px] px-4">
                    <Image
                        className="w-6 h-6 "
                        source={icons.mail}
                        resizeMode="contain"
                    />
                    <TextInput
                        onChangeText={(e) => setForm({...form, email: e})}
                        className="flex-1 font-pmedium ml-2"
                        placeholder="Email address"
                        keyboardType="email-address"
                    />
                </View>

                <View className="mt-6 rounded-3xl border-2 border-[#E7E7E7] flex-row items-center w-full h-[56px] px-4">
                    <Image className="w-6 h-6" source={icons.lock} resizeMode="contain"/>
                    <TextInput
                        onChangeText={(e) => setForm({...form, password: e})}
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

                <View
                    className=" mt-6 rounded-3xl border-2 border-[#E7E7E7] flex-row items-center w-full h-[56px] px-4">
                    <Image
                        className="w-6 h-6 "
                        source={icons.user}
                        resizeMode="contain"
                    />
                    <TextInput
                        onChangeText={(e) => setForm({...form, firstName: e})}
                        className="flex-1 font-pmedium ml-2"
                        placeholder="First Name"
                    />
                </View>

                <View
                    className=" mt-6 rounded-3xl border-2 border-[#E7E7E7] flex-row items-center w-full h-[56px] px-4">
                    <Image
                        className="w-6 h-6 "
                        source={icons.user}
                        resizeMode="contain"
                    />
                    <TextInput
                        onChangeText={(e) => setForm({...form, lastName: e})}
                        className="flex-1 font-pmedium ml-2"
                        placeholder="Last Name"
                    />
                </View>

                {/*Date picker field start*/}
                <TouchableOpacity
                    onPress={() => setShowDateOfBirth(true)}
                    className=" mt-6 rounded-3xl border-2 border-[#E7E7E7] flex-row items-center w-full h-[56px] px-4">

                    <Image
                        resizeMode="contain"
                        className="w-6 h-6"
                        source={icons.calendar}/>

                    <Text className="flex-1 text-gray-300 ml-2">
                        {date.toLocaleDateString()} Date Of Birth
                    </Text>
                </TouchableOpacity>
                {showDateOfBirth && (
                    <DateTimePicker
                        mode="date"
                        value={date}
                        display="default"
                        onChange={onchange}
                    />
                )}

                <View className="flex-row items-center w-full h-[56px] px-4">
                    <Checkbox 
                        value={checked} 
                        onValueChange={ToggleTerms}
                        color={checked ? '#0066FF' : undefined}
                    />
                    <Text className="ml-3">I agree to the terms and conditions</Text>
                </View>

                <TouchableOpacity
                    onPress={handleSubmit}
                    className="mt-5 flex-row p-3 rounded-full items-center justify-center"
                    style={{backgroundColor: '#0066FF'}}
                >
                    <Text className="ml-3 text-lg text-white items-center justify-center">Submit</Text>
                </TouchableOpacity>

                <View className="w-full justify-end items-center pt-3 flex-row">
                    <Text className="font-pregular text-gray-200">Already have an account? </Text>
                    <Link href="/Login" className="text-lg mx-2" style={{color: '#0066FF'}}>Login</Link>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default Register;