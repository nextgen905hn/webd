import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
export default function RateUsModal({ visible, onClose }) {
  const [rating, setRating] = useState(0);
  const [slideAnim] = useState(new Animated.Value(300)); // Start below screen

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 30,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.background} onPress={onClose} />
        <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.title}>Rate Us ⭐</Text>
          <Text style={styles.subtitle}>How would you rate your experience?</Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((i) => (
              <TouchableOpacity key={i} onPress={() => setRating(i)}>
                <Ionicons
                  name={i <= rating ? "star" : "star-outline"}
                  size={40}
                  color={i <= rating ? "#FFD700" : "#888"}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={onClose}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  background: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginBottom: 35,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: "#fff",
    marginBottom: 5,
  },
  subtitle: {
    textAlign: "center",
    color: "#bbb",
    marginBottom: 15,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  submitBtn: {
    backgroundColor: "#FFD700",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 15,
  },
  submitText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#000",
    fontSize: 16,
  },
});
