import React, { useEffect, useState } from 'react'
import {View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Platform} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useGlobalStore} from "../../context/globalStore";
import {icons, images} from "../../constants";
import {Link} from "expo-router";
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from "../../utility/firebaseConfig"

const Home = () => {
    const {user, userData} = useGlobalStore()
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)

    const getGreeting = () => {
        const date = new Date()
        const hours = date.getHours()

        if (hours < 12) {
            return 'Good morning'
        } else if (hours < 16) {
            return 'Good Afternoon'
        } else {
            return 'Good Evening'
        }
    }

    // Fetch transactions from Firebase
    useEffect(() => {
        const fetchTransactions = async () => {
            if (!user?.uid) return;
            
            try {
                const transactionsRef = collection(db, 'transactions');
                const q = query(
                    transactionsRef,
                    where('userId', '==', user.uid),
                    orderBy('createdAt', 'desc'),
                    limit(4)
                );
                
                const querySnapshot = await getDocs(q);
                const transactionData = [];
                
                querySnapshot.forEach((doc) => {
                    transactionData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                setTransactions(transactionData);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [user?.uid]);

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'transfer':
                return icons.arrowUpRight || icons.send || '↗️'; // Arrow pointing up-right for sending money
            case 'receive':
                return icons.arrowDownLeft || icons.receive || '↙️'; // Arrow pointing down-left for receiving money
            case 'deposit':
                return icons.plus || icons.deposit || '💰'; // Plus icon for adding money
            case 'withdraw':
                return icons.minus || icons.withdraw || '🏧'; // Minus icon for removing money
            case 'bill_payment':
                return icons.receipt || icons.bill || '📄'; // Receipt icon for bill payments
            case 'airtime':
                return icons.smartphone || icons.phone || '📱'; // Smartphone icon for airtime/mobile top-up
            default:
                return icons.creditCard || icons.transaction || '💳'; // Credit card for general transactions
        }
    };

    const formatTransactionTitle = (transaction) => {
        switch (transaction.type) {
            case 'transfer':
                return `Transfer to ${transaction.recipientName || 'Account'}`;
            case 'receive':
                return `Received from ${transaction.senderName || 'Account'}`;
            case 'deposit':
                return 'Account Deposit';
            case 'withdraw':
                return 'Cash Withdrawal';
            case 'bill_payment':
                return `${transaction.billType || 'Bill'} Payment`;
            case 'airtime':
                return 'Airtime Purchase';
            default:
                return transaction.description || 'Transaction';
        }
    };

    return (
        <SafeAreaView className="bg-white w-full h-full">
            {/* Header */}
            <View className="flex-row justify-between items-center px-4 pt-4 pb-4">
                <View className="flex-row items-center">
                    <Image 
                        className="w-10 h-10 rounded-full mr-3" 
                        source={userData?.profileImage ? {uri: userData.profileImage} : require("../../assets/logo/profile_logo.png")} 
                        resizeMode="cover"
                    />
                    <View>
                        <Text className="text-sm text-gray-500">{getGreeting()},</Text>
                        <Text className="text-lg font-semibold text-black">{userData?.firstName} {userData?.lastName}</Text>
                    </View>
                </View>
                <TouchableOpacity>
                    {/* More relevant notification icon */}
                    <Image className="w-6 h-6" source={icons.bell || icons.notification} resizeMode="contain" style={{tintColor: '#0066FF'}}/>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
            >
                {/* Card Section */}
                <View className="px-4 mb-6">
                    <View className="rounded-2xl p-6 relative overflow-hidden" style={{backgroundColor: '#0066FF'}}>
                        {/* Card Background Pattern */}
                        <View className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white opacity-10 -mr-16 -mt-16"></View>
                        <View className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white opacity-10 -ml-12 -mb-12"></View>
                        
                        {/* Balance */}
                        <View className="mb-4">
                            <Text className="text-white opacity-80 text-sm mb-1">Available Balance</Text>
                            <Text className="text-white text-3xl font-bold">
                                ${userData?.balance ? userData.balance.toFixed(2) : '0.00'}
                            </Text>
                        </View>
                        
                        {/* Account Number */}
                        <Text 
                            className="text-white text-lg tracking-widest mb-6 opacity-90"
                            style={{ fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}
                        >
                            {userData?.accountNumber ? 
                                `${userData.accountNumber.slice(0,3)} ${userData.accountNumber.slice(3,6)} ${userData.accountNumber.slice(6,9)} ${userData.accountNumber.slice(12)}` 
                                : "•••• •••• •••• ••••"
                            }
                        </Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View className="px-4 mb-6">
                    <View className="flex-row justify-around">
                        <TouchableOpacity className="items-center">
                            <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{backgroundColor: '#0066FF20'}}>
                                {/* Arrow up-right for money transfer */}
                                <Image className="w-6 h-6" source={icons.arrowUpRight || icons.send} resizeMode="contain" style={{tintColor: '#0066FF'}}/>
                            </View>
                            <Text className="text-gray-700 text-sm">Transfer</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity className="items-center">
                            <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{backgroundColor: '#0066FF20'}}>
                                {/* ATM/Banknotes icon for withdrawal */}
                                <Image className="w-6 h-6" source={icons.banknote || icons.atm || icons.withdraw} resizeMode="contain" style={{tintColor: '#0066FF'}}/>
                            </View>
                            <Text className="text-gray-700 text-sm">Withdraw</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity className="items-center">
                            <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{backgroundColor: '#0066FF20'}}>
                                {/* Plus or wallet icon for deposit */}
                                <Image className="w-6 h-6" source={icons.wallet || icons.plus || icons.deposit} resizeMode="contain" style={{tintColor: '#0066FF'}}/>
                            </View>
                            <Text className="text-gray-700 text-sm">Deposit</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Second Row Actions */}
                <View className="px-4 mb-8">
                    <View className="flex-row justify-around">
                        <TouchableOpacity className="items-center">
                            <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{backgroundColor: '#0066FF20'}}>
                                {/* Receipt or file-text icon for bills */}
                                <Image className="w-6 h-6" source={icons.receipt || icons.fileText || icons.bill} resizeMode="contain" style={{tintColor: '#0066FF'}}/>
                            </View>
                            <Text className="text-gray-700 text-sm">Pay Bills</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity className="items-center">
                            <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{backgroundColor: '#0066FF20'}}>
                                {/* Smartphone icon for mobile top-up/airtime */}
                                <Image className="w-6 h-6" source={icons.smartphone || icons.mobile || icons.phone} resizeMode="contain" style={{tintColor: '#0066FF'}}/>
                            </View>
                            <Text className="text-gray-700 text-sm">Buy Load</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity className="items-center">
                            <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{backgroundColor: '#0066FF20'}}>
                                {/* Trending up or bar chart icon for investments */}
                                <Image className="w-6 h-6" source={icons.trendingUp || icons.barChart || icons.chart} resizeMode="contain" style={{tintColor: '#0066FF'}}/>
                            </View>
                            <Text className="text-gray-700 text-sm">Investments</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Transaction Section */}
                <View className="px-4">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-semibold text-black">Recent Transactions</Text>
                        <Link href="/Transactions" style={{color: '#0066FF'}}>
                            <Text style={{color: '#0066FF'}}>See All</Text>
                        </Link>
                    </View>

                    {/* Transaction List */}
                    <View className="bg-white">
                        {loading ? (
                            <View className="flex-row items-center justify-center py-8">
                                <ActivityIndicator size="small" color="#0066FF" />
                                <Text className="text-gray-400 text-base ml-2">Loading transactions...</Text>
                            </View>
                        ) : transactions.length === 0 ? (
                            <View className="flex-row items-center justify-center py-8">
                                {/* Inbox or folder icon for empty state */}
                                <Image className="w-5 h-5 mr-2" source={icons.inbox || icons.folder || icons.empty} resizeMode="contain" style={{tintColor: '#0066FF'}}/>
                                <Text className="text-gray-400 text-base">No transaction history</Text>
                            </View>
                        ) : (
                            transactions.map((transaction, index) => (
                                <TouchableOpacity
                                    key={transaction.id}
                                    className="flex-row items-center justify-between py-4 border-b border-gray-100"
                                >
                                    <View className="flex-row items-center">
                                        <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-3">
                                            <Image 
                                                className="w-5 h-5" 
                                                source={getTransactionIcon(transaction.type)} 
                                                resizeMode="contain"
                                                style={{tintColor: transaction.type === 'receive' ? '#10B981' : '#0066FF'}}
                                            />
                                        </View>
                                        <View>
                                            <Text className="text-black font-medium text-base">
                                                {formatTransactionTitle(transaction)}
                                            </Text>
                                            <Text className="text-gray-500 text-sm">
                                                {transaction.category || new Date(transaction.createdAt?.toDate()).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    <Text className={`font-semibold text-base ${
                                        transaction.type === 'receive' || transaction.type === 'deposit' 
                                            ? 'text-green-600' 
                                            : 'text-red-600'
                                    }`}>
                                        {transaction.type === 'receive' || transaction.type === 'deposit' ? '+' : '-'}
                                        ${transaction.amount?.toFixed(2) || '0.00'}
                                    </Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                </View>

                {/* Bottom spacing */}
                <View className="h-20"></View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Home