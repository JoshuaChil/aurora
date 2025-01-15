
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Animated, TouchableOpacity, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform } from 'react-native';

const ScreenOne = ({ setScreen, setInput, fetchSentenceFromBackend }) => {
  const [text, setText] = useState('');  // 
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    fadeIn();
  }, []);

  const handleSubmit = () => {
    setInput(text);  
    fetchSentenceFromBackend(text).then(setScreen(2));  
    
  };

  return (
    <LinearGradient colors={["#1D2671", "#C33764"]} style={styles.container}>
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
        <Text style={styles.logoText}>AURORA</Text>
      </Animated.View>
      <TextInput
        style={styles.input}
        placeholder="How did your day go?"
        placeholderTextColor="#fff"
        value={text}  
        onChangeText={setText}  
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};


const ScreenTwo = ({ setScreen, sentence, dragState, setDragState }) => {
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initializeGame = () => {
    const { allWords } = dragState;
    const nextWords = shuffleArray(allWords.slice(0, 4)).map((word) => ({
      word,
      anim: new Animated.Value(0),
    }));
    setDragState({
      ...dragState,
      currentWords: nextWords,
      correctlyOrdered: Array(allWords.length).fill(null),
      currentChunkIndex: 0, 
    });

   
    nextWords.forEach(({ anim }) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    });
  };

  useEffect(() => {
    if (dragState.allWords.length > 0) {
      initializeGame();
    }
  }, [dragState.allWords]);

  const handleDrop = (word) => {
    const { correctlyOrdered, currentWords, allWords, currentChunkIndex } = dragState;
    const chunkStartIndex = currentChunkIndex * 4; 
    const correctWord = allWords[chunkStartIndex + correctlyOrdered.slice(chunkStartIndex).filter(Boolean).length];

    if (word === correctWord) {
      const newCorrect = [...correctlyOrdered];
      const nextIndex = chunkStartIndex + newCorrect.slice(chunkStartIndex, chunkStartIndex + 4).findIndex((item) => item === null);
      if (nextIndex !== -1) newCorrect[nextIndex] = word;

      const remainingWords = allWords.slice(chunkStartIndex + newCorrect.slice(chunkStartIndex, chunkStartIndex + 4).filter(Boolean).length, chunkStartIndex + 8);

      setDragState((prevState) => ({
        ...prevState,
        correctlyOrdered: newCorrect,
      }));

      if (newCorrect.filter(Boolean).length === allWords.length) {
      
        setTimeout(() => setScreen(3), 1000);
      } else if (newCorrect.slice(chunkStartIndex, chunkStartIndex + 4).filter(Boolean).length === 4) {
       
        currentWords.forEach(({ anim }, index) => {
          Animated.timing(anim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }).start(() => {
            if (index === currentWords.length - 1) {
              const nextWords = shuffleArray(remainingWords).map((nextWord) => ({
                word: nextWord,
                anim: new Animated.Value(0),
              }));
              setDragState((prevState) => ({
                ...prevState,
                currentWords: nextWords,
                currentChunkIndex: prevState.currentChunkIndex + 1,
              }));

              nextWords.forEach(({ anim }) => {
                Animated.timing(anim, {
                  toValue: 1,
                  duration: 1000,
                  useNativeDriver: true,
                }).start();
              });
            }
          });
        });
      }
    }
  };

  const createPanResponder = (word) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, gestureState) => {
        handleDrop(word);
      },
    });
  };

  return (
    <LinearGradient colors={["#1D2671", "#C33764"]} style={styles.container}>
      <View style={styles.gameContainer}>
        <View style={styles.blanksContainer}>
          {dragState.correctlyOrdered
            .slice(dragState.currentChunkIndex * 4, dragState.currentChunkIndex * 4 + 4)
            .map((word, index) => (
              <Animated.Text
                key={index}
                style={[styles.blank, { opacity: 1 }]} 
              >
                {word || "____"} {/* Render placeholder for null or empty */}
              </Animated.Text>
            ))}
        </View>
        <View style={styles.bubblesContainer}>
          {dragState.currentWords.map(({ word, anim }, index) => {
            const panResponder = createPanResponder(word);
            return (
              <Animated.View
                {...panResponder.panHandlers}
                key={index}
                style={[styles.bubble, { opacity: anim }]}
              >
                <Text style={styles.bubbleText}>{word}</Text>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </LinearGradient>
  );
};



const ScreenThree = ({ setScreen, sentence, author }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    fadeIn();
  }, []);

  return (
    <LinearGradient colors={["#1D2671", "#C33764"]} style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.finalSentenceContainer}>
          <LinearGradient
            colors={['#1D2671', '#C33764']} 
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.finalSentenceGradient}
          >
            <Text style={styles.finalSentence}>{sentence}</Text>
          </LinearGradient>
        </View>
        <Text style={styles.authorText}>- {author}</Text>
        <TouchableOpacity style={styles.button} onPress={() => setScreen(1)}>
          <Text style={styles.buttonText}>Restart</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};


export default function App() {
  const [screen, setScreen] = useState(1);
  const [input, setInput] = useState('');  
  const [sentence, setSentence] = useState("");
  const [author, setAuthor] = useState(""); 
  const [dragState, setDragState] = useState({ currentIndex: 0, currentWords: ["_", "_", "_", "_"], allWords: sentence.split(' '), correctlyOrdered: [] });

  const fetchSentenceFromBackend = async (userFeeling) => {
    try {
      const API_URL = #INSERT_BACKEND_URL_HERE;
  
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: userFeeling }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      const newSentence = data.quote;
      const author = data.author;
  
      setSentence(newSentence);
      setAuthor(author);
  
     
      setDragState({
        currentIndex: 0,
        currentWords: ['_', '_', '_', '_'],
        allWords: newSentence.split(' '),
        correctlyOrdered: [],
      });
    } catch (error) {
      console.error("Error fetching data from backend:", error);
    }
  };
  

  switch (screen) {
    case 1:
      return <ScreenOne 
                setScreen={setScreen} 
                setInput={setInput} 
                fetchSentenceFromBackend={fetchSentenceFromBackend} 
                input={input} 
              />;
    case 2:
      return <ScreenTwo setScreen={setScreen} sentence={sentence} dragState={dragState} setDragState={setDragState} />;
    case 3:
      return <ScreenThree setScreen={setScreen} sentence={sentence} author={author} />; 
      return null;
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  input: {
    marginTop: 20,
    width: 250,
    height: 50,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    color: '#fff',
  },
  button: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blanksContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  blank: {
    marginHorizontal: 5,
    borderBottomWidth: 2,
    borderColor: '#fff',
    color: '#fff',
    padding: 5,
    fontSize: 18,
  },
  bubblesContainer: {
    flexDirection: 'row',
  },
  bubble: {
    marginHorizontal: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 50,
  },
  bubbleText: {
    color: '#1D2671',
    fontWeight: 'bold',
  },
  finalSentenceContainer: {
    padding: 0,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    margin: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finalSentenceGradient: {
    padding: 10,
    borderRadius: 10,
  },
  finalSentence: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  authorText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
    marginTop: 10,
  },
});