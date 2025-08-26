import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { 
  StyleSheet, Text, TouchableOpacity, View, Image, SafeAreaView, 
  ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

export default function App() {
  const [photo, setPhoto] = useState(null);
  const [editedPhoto, setEditedPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  function openAlbum() {
    launchImageLibrary(
      { mediaType: "photo", quality: 0.5, selectionLimit: 1 },
      (response) => {
        if (response.didCancel || response.error) return;
        setPhoto(response.assets[0].uri);
        setEditedPhoto(null);
      }
    );
  }

  async function openCamera() {
    const response = await launchCamera(
      { mediaType: "photo", quality: 0.5, selectionLimit: 1 }
    );
    if (!response.didCancel && !response.error) {
      setPhoto(response.assets[0].uri);
      setEditedPhoto(null);
    }
  }

  const editImage = async (tema) => {
    if (!photo) return Alert.alert("Atenção", "Selecione uma foto antes de aplicar um estilo.");

    try {
      setLoading(true);
      setEditedPhoto(null);

      const filename = photo.split("/").pop() || "imagem.jpg";
      const photoResponse = await fetch(photo);
      const blob = await photoResponse.blob();

      const formData = new FormData();
      formData.append("imagem", blob, filename);
      formData.append("tema", tema);

      const res = await fetch("https://api-mural.onrender.com/api/editar-imagem", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Erro do servidor: ${res.status}`);
      const data = await res.json();
      setEditedPhoto(data.novaImagemUrl);

    } catch (error) {
      console.error("Erro na edição:", error);
      Alert.alert("Erro", "Não foi possível editar a imagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Edição com IA</Text>
        <Text style={styles.subtitle}>Escolha ou tire uma foto para aplicar estilos criativos</Text>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.primaryButton} onPress={openAlbum}>
            <Text style={styles.primaryButtonText}>Abrir Álbum</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={openCamera}>
            <Text style={styles.secondaryButtonText}>Abrir Câmera</Text>
          </TouchableOpacity>
        </View>

        {photo && <Image source={{ uri: photo }} style={styles.image} />}

        {loading && <ActivityIndicator size="large" color="#111827" style={{ marginVertical: 20 }} />}

        {editedPhoto && (
          <>
            <Text style={styles.subtitle}>Resultado:</Text>
            <Image source={{ uri: editedPhoto }} style={styles.image} />
          </>
        )}

        <Text style={styles.subtitle}>Estilos disponíveis</Text>
        <View style={styles.buttonsBottom}>
          {["Estúdio Ghibli", "Boobie Goods", "Pixel-Art", "Cyberpunk", "Pistache", "Vintage", "Preto e Branco", "Playstation 2"].map((style, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.styleButton, index === 0 ? styles.activeStyleButton : {}]}
              onPress={() => editImage(style)}
            >
              <Text style={[styles.styleButtonText, index === 0 ? styles.activeStyleButtonText : {}]}>
                {style}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 4,
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    textAlign: "center",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: "#111827",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: "#111827",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
  secondaryButtonText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 16,
  },
  image: {
    width: "100%",
    height: 280,
    borderRadius: 16,
    resizeMode: "cover",
    marginTop: 10,
    marginBottom: 20,
  },
  buttonsBottom: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 30,
  },
  styleButton: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
  },
  styleButtonText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  activeStyleButton: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  activeStyleButtonText: {
    color: "#fff",
  },
});
