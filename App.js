import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, Button, TouchableOpacity, StatusBar, FlatList, Modal, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon, Overlay } from 'react-native-elements';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from './styles';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [unlearnedWords, setUnlearnedWords] = useState([]);
  const [learnedWords, setLearnedWords] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [showLearnedWords, setShowLearnedWords] = useState(false);
  const [flippedIndexes, setFlippedIndexes] = useState([]);
  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);
  const [notificationTime, setNotificationTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeSelected, setTimeSelected] = useState(false);

  useEffect(() => {
    loadWords();
    loadNotificationTime();
    registerForPushNotificationsAsync();
  }, []);

  const loadWords = async () => {
    try {
      const savedUnlearnedWords = await AsyncStorage.getItem('unlearnedWords');
      const savedLearnedWords = await AsyncStorage.getItem('learnedWords');
      const savedNotificationList = await AsyncStorage.getItem('notifiedWords');
      if (savedUnlearnedWords) {
        const parsedUnlearnedWords = JSON.parse(savedUnlearnedWords);
        setUnlearnedWords(parsedUnlearnedWords.sort((a, b) => a.text.localeCompare(b.text)));
        setFlippedIndexes(new Array(parsedUnlearnedWords.length).fill(false));
      }
      if (savedLearnedWords) {
        setLearnedWords(JSON.parse(savedLearnedWords).sort((a, b) => a.text.localeCompare(b.text)));
      }
      if (savedNotificationList) {
        setNotifiedWords(JSON.parse(savedNotificationList));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadNotificationTime = async () => {
    try {
      const savedTime = await AsyncStorage.getItem('notificationTime');
      if (savedTime) {
        setNotificationTime(new Date(savedTime));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveWords = async (unlearnedWords, learnedWords) => {
    try {
      await AsyncStorage.setItem('unlearnedWords', JSON.stringify(unlearnedWords));
      await AsyncStorage.setItem('learnedWords', JSON.stringify(learnedWords));
    } catch (e) {
      console.error(e);
    }
  };

  const saveNotificationList = async (notifiedWords) => {
    try {
      await AsyncStorage.setItem('notifiedWords', JSON.stringify(notifiedWords));
    } catch (e) {
      console.error(e);
    }
  };

  const addWord = async () => {
    if (newWord.trim() === '' || newDefinition.trim() === '') return;
    const updatedUnlearnedWords = [...unlearnedWords, { text: newWord, definitions: [newDefinition], currentDefIndex: 0 }];
    updatedUnlearnedWords.sort((a, b) => a.text.localeCompare(b.text));
    setUnlearnedWords(updatedUnlearnedWords);
    setFlippedIndexes([...flippedIndexes, false]);
    saveWords(updatedUnlearnedWords, learnedWords);
    setNewWord('');
    setNewDefinition('');
    setOverlayVisible(false);
  };

  const clearWords = async () => {
    setUnlearnedWords([]);
    setLearnedWords([]);
    setFlippedIndexes([]);
    await AsyncStorage.removeItem('unlearnedWords');
    await AsyncStorage.removeItem('learnedWords');
    await AsyncStorage.removeItem('notifiedWords');
  };

  const markAsLearned = (index) => {
    const word = unlearnedWords[index];
    const updatedUnlearnedWords = unlearnedWords.filter((_, i) => i !== index);
    const updatedLearnedWords = [...learnedWords, word];
    updatedLearnedWords.sort((a, b) => a.text.localeCompare(b.text));
    setUnlearnedWords(updatedUnlearnedWords);
    setLearnedWords(updatedLearnedWords);
    setFlippedIndexes(flippedIndexes.filter((_, i) => i !== index));
    saveWords(updatedUnlearnedWords, updatedLearnedWords);
  };

  const flipCard = (index) => {
    setFlippedIndexes(flippedIndexes.map((flipped, i) => (i === index ? !flipped : flipped)));
  };

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || notificationTime;
    setShowTimePicker(Platform.OS === 'ios');
    setNotificationTime(currentTime);
    setTimeSelected(true);
  };

  const confirmTimeSelection = () => {
    setShowTimePicker(false);
    saveNotificationTime(notificationTime);
    scheduleNotification(notificationTime);
  };

  const saveNotificationTime = async (time) => {
    try {
      await AsyncStorage.setItem('notificationTime', time.toISOString());
    } catch (e) {
      console.error(e);
    }
  };

  const scheduleNotification = async (time) => {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const trigger = new Date(time);
    trigger.setSeconds(0);
    if (trigger <= new Date()) {
      trigger.setDate(trigger.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Word of the Day",
        body: "Check your app to see today's word!",
      },
      trigger: {
        hour: trigger.getHours(),
        minute: trigger.getMinutes(),
        repeats: true,
      },
    });
  };

  const sendRandomWordNotification = async () => {
    const notifiedWords = await AsyncStorage.getItem('notifiedWords');
    const notifiedWordsList = notifiedWords ? JSON.parse(notifiedWords) : [];
    const availableWords = unlearnedWords.filter(word => !notifiedWordsList.includes(word.text));

    if (availableWords.length === 0) {
      notifiedWordsList.length = 0;
      await AsyncStorage.setItem('notifiedWords', JSON.stringify(notifiedWordsList));
    }

    if (availableWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableWords.length);
      const word = availableWords[randomIndex];

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Word of the Day: ${word.text}`,
          body: word.definitions[0],
        },
        trigger: null,
      });

      notifiedWordsList.push(word.text);
      await AsyncStorage.setItem('notifiedWords', JSON.stringify(notifiedWordsList));
    } else {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "No Words Available",
          body: "Add more words to start learning!",
        },
        trigger: null,
      });
    }
  };

  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'ios') {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
    }

    Notifications.addNotificationReceivedListener(sendRandomWordNotification);
  };

  const renderLeftActions = () => (
    <View style={styles.swipeAction}>
      <Text style={styles.swipeText}>Learned</Text>
    </View>
  );

  const renderRightActions = () => (
    <View style={styles.swipeAction}>
      <Text style={styles.swipeText}>Learned</Text>
    </View>
  );

  const renderItem = ({ item, index }) => {
    const isFlipped = flippedIndexes[index];

    return (
      <Swipeable
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        onSwipeableOpen={() => markAsLearned(index)}
      >
        <TouchableOpacity onPress={() => flipCard(index)}>
          <View style={styles.cardContainer}>
            {!isFlipped ? (
              <View style={styles.card}>
                <Text style={styles.word}>{item.text}</Text>
              </View>
            ) : (
              <View style={[styles.card, styles.cardBack]}>
                <Text style={styles.definition}>
                  {item.definitions[item.currentDefIndex]}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => setSettingsModalVisible(true)}
      >
        <Icon name="settings" size={30} color="white" />
      </TouchableOpacity>
      <View style={styles.listContainer}>
        {showLearnedWords ? (
          learnedWords.length > 0 ? (
            <FlatList
              data={learnedWords}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
            />
          ) : (
            <View style={styles.centeredContainer}>
              <Text>No words learned yet.</Text>
            </View>
          )
        ) : (
          unlearnedWords.length > 0 ? (
            <FlatList
              data={unlearnedWords}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
            />
          ) : (
            <View style={styles.centeredContainer}>
              <Text>No words added yet.</Text>
            </View>
          )
        )}
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setOverlayVisible(true)}
      >
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>
      {isOverlayVisible && (
        <Overlay isVisible={isOverlayVisible} onBackdropPress={() => setOverlayVisible(false)}>
          <View style={styles.overlayContainer}>
            <TextInput
              style={styles.input}
              value={newWord}
              onChangeText={setNewWord}
              placeholder="Add a new word"
            />
            <TextInput
              style={styles.input}
              value={newDefinition}
              onChangeText={setNewDefinition}
              placeholder="Add a definition"
            />
            <Button title="Add Word" onPress={addWord} />
          </View>
        </Overlay>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSettingsModalVisible}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowLearnedWords(!showLearnedWords);
                setSettingsModalVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>
                {showLearnedWords ? 'Show Unlearned Words' : 'Show Learned Words'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                clearWords();
                setSettingsModalVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>Delete All Words</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.modalButtonText}>Set Notification Time</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={notificationTime}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
            {timeSelected && (
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmTimeSelection}
              >
                <Icon name="check" size={30} color="white" />
              </TouchableOpacity>
            )}
            <Button title="Close" onPress={() => setSettingsModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
}
