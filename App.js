import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, Button, TouchableOpacity, StatusBar, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon, Overlay } from 'react-native-elements';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import styles from './styles';

export default function App() {
  const [unlearnedWords, setUnlearnedWords] = useState([]);
  const [learnedWords, setLearnedWords] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [showLearnedWords, setShowLearnedWords] = useState(false);
  const [flippedIndexes, setFlippedIndexes] = useState([]);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      const savedUnlearnedWords = await AsyncStorage.getItem('unlearnedWords');
      const savedLearnedWords = await AsyncStorage.getItem('learnedWords');
      if (savedUnlearnedWords) {
        const parsedUnlearnedWords = JSON.parse(savedUnlearnedWords);
        setUnlearnedWords(parsedUnlearnedWords);
        setFlippedIndexes(new Array(parsedUnlearnedWords.length).fill(false));
      }
      if (savedLearnedWords) {
        setLearnedWords(JSON.parse(savedLearnedWords));
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

  const addWord = async () => {
    if (newWord.trim() === '' || newDefinition.trim() === '') return;
    const updatedUnlearnedWords = [...unlearnedWords, { text: newWord, definitions: [newDefinition], currentDefIndex: 0 }];
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
  };

  const markAsLearned = (index) => {
    const word = unlearnedWords[index];
    const updatedUnlearnedWords = unlearnedWords.filter((_, i) => i !== index);
    const updatedLearnedWords = [...learnedWords, word];
    setUnlearnedWords(updatedUnlearnedWords);
    setLearnedWords(updatedLearnedWords);
    setFlippedIndexes(flippedIndexes.filter((_, i) => i !== index));
    saveWords(updatedUnlearnedWords, updatedLearnedWords);
  };

  const flipCard = (index) => {
    setFlippedIndexes(flippedIndexes.map((flipped, i) => (i === index ? !flipped : flipped)));
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
        style={styles.toggleButton}
        onPress={() => setShowLearnedWords(!showLearnedWords)}
      >
        <Text style={styles.toggleButtonText}>
          {showLearnedWords ? 'Show Unlearned Words' : 'Show Learned Words'}
        </Text>
      </TouchableOpacity>
      {showLearnedWords ? (
        learnedWords.length > 0 ? (
          <View style={styles.listContainer}>
            <FlatList
              data={learnedWords}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        ) : (
          <View style={styles.centeredContainer}>
            <Text>No words learned yet.</Text>
          </View>
        )
      ) : (
        unlearnedWords.length > 0 ? (
          <View style={styles.listContainer}>
            <FlatList
              data={unlearnedWords}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        ) : (
          <View style={styles.centeredContainer}>
            <Text>No words added yet.</Text>
          </View>
        )
      )}
      <TouchableOpacity
        style={styles.clearButton}
        onPress={clearWords}
      >
        <Icon name="delete" size={30} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setOverlayVisible(true)}
      >
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.shuffleButton}
        onPress={() => {
          const shuffledWords = [...unlearnedWords].sort(() => Math.random() - 0.5);
          setUnlearnedWords(shuffledWords);
          saveWords(shuffledWords, learnedWords);
          setFlippedIndexes(new Array(shuffledWords.length).fill(false));
        }}
      >
        <Icon name="shuffle" size={30} color="white" />
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
    </GestureHandlerRootView>
  );
}
