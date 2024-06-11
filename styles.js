import { StyleSheet, StatusBar } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: StatusBar.currentHeight || 40, // Add padding for status bar height or default 40
  },
  listContainer: {
    flex: 1,
    marginTop: 90, // Adjust to place the list below the icons
    marginBottom: 70,
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  card: {
    width: 300,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f0',
    borderRadius: 10,
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    backgroundColor: '#e0e0e0',
  },
  word: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  definition: {
    fontSize: 16,
    color: '#666',
  },
  swipeAction: {
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 20,
    marginBottom: 20,
    borderRadius: 10,
  },
  swipeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shuffleButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    position: 'absolute',
    top: 60, // Move down for iPhone notch
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContainer: {
    width: 300,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 200,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});