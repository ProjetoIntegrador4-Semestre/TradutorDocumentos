import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FB", // Fundo suave
    padding: 20,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "600",
    color: "#1C1C1C", // Cor do texto mais escura
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#D3D8E1",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#0521abff", // Azul claro para botões
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  tabButton: {
    backgroundColor: "#172e47ff",
    padding: 10,
    borderRadius: 30,
    marginHorizontal: 10,
  },
  tabButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D3D8E1",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C1C1C",
  },
  cardText: {
    fontSize: 16,
    color: "#7D7D7D",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  filterButton: {
    backgroundColor: "#E6F1FF", // Azul claro para filtro
    padding: 10,
    borderRadius: 12,
  },
  filterButtonText: {
    color: "#007BFF",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  profileSection: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: "#D3D8E1",
  },
  profileInput: {
    backgroundColor: "#EFEFEF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  switchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: "#7D7D7D",
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  restrictedText: {
    fontSize: 20,
    textAlign: "center",
    color: "#FF5555",
  },
  logoutButton: {
    backgroundColor: "#FF4B4B", // Vermelho para logout
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
});

export default styles;
