import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { 
  StyleSheet, Text, TouchableOpacity, View, Image, SafeAreaView, 
  ActivityIndicator, Alert 
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

export default function App() {
  const [photo, setPhoto] = useState(null);          // Foto original
  const [editedPhoto, setEditedPhoto] = useState(null); // Foto editada
  const [loading, setLoading] = useState(false);     // Carregamento

  // Abrir álbum
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

  // Abrir câmera
  async function openCamera() {
    const response = await launchCamera(
      { mediaType: "photo", quality: 0.5, selectionLimit: 1 }
    );
    if (!response.didCancel && !response.error) {
      setPhoto(response.assets[0].uri);
      setEditedPhoto(null);
    }
  }

  // Função para editar imagem
  const editImage = async (tema) => {
    if (!photo) return Alert.alert("Atenção", "Selecione uma foto antes de aplicar um estilo.");

    try {
      setLoading(true);
      setEditedPhoto(null);

      const filename = photo.split("/").pop() || "imagem.jpg";

      // Converte URI em blob
      const photoResponse = await fetch(photo);
      const blob = await photoResponse.blob();

      // Cria FormData
      const formData = new FormData();
      formData.append("imagem", blob, filename); // ⚠ nome do campo = 'imagem'
      formData.append("tema", tema);

      // POST para o backend
      const res = await fetch("https://api-mural.onrender.com/api/editar-imagem", {
        method: "POST",
        body: formData,
        // ❌ Não definir headers
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

      <Text style={styles.title}>Edição com IA</Text>
      <Text style={styles.subtitle}>Escolha ou tire uma foto para editar</Text>

      {/* Botões de abrir câmera/álbum */}
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={openAlbum}>
          <Text style={styles.buttonText}>Abrir Álbum</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.outlineButton]} onPress={openCamera}>
          <Text style={[styles.buttonText, styles.outlineText]}>Abrir Câmera</Text>
        </TouchableOpacity>
      </View>

      {/* Foto original */}
      {photo && <Image source={{ uri: photo }} style={styles.image} />}

      {/* Loader */}
      {loading && <ActivityIndicator size="large" color="#111827" style={{ marginVertical: 20 }} />}

      {/* Foto editada */}
      {editedPhoto && (
        <>
          <Text style={styles.subtitle}>Resultado:</Text>
          <Image source={{ uri: editedPhoto }} style={styles.image} />
        </>
      )}

      {/* Botões de estilo */}
      <View style={styles.buttonsBottom}>
        {["Estúdio Ghibli", "Boobie Goods", "Pixel-Art", "Cyberpunk", "Pistache", "Vintage", "Preto e Branco"].map((style, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.styleButton, index === 0 ? styles.primaryStyleButton : styles.outlineButton]}
            onPress={() => editImage(style)}
          >
            <Text style={[styles.buttonText, index === 0 ? {} : styles.outlineText]}>{style}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginTop: 40,
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 12,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#111827",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "500",
    fontSize: 16,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#111827",
  },
  outlineText: {
    color: "#111827",
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 16,
    resizeMode: "cover",
    marginTop: 10,
    marginBottom: 10,
  },
  buttonsBottom: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  styleButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    margin: 4,
  },
  primaryStyleButton: {
    backgroundColor: "#111827",
  },
});
