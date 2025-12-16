const tintColorLight = '#60A5FA'; // Cor principal para ícones e botões no modo claro
const tintColorDark = '#2c5089ff';  // Cor principal para ícones e botões no modo escuro

export default {
  light: {
    text: '#f1f1f1ff', // Cor para o texto
    background: '#F6F7F9', // Cor de fundo
    tint: tintColorLight,  // Cor dos ícones e botões
    tabIconDefault: '#E5E7EB', // Cor padrão dos ícones nas abas
    tabIconSelected: tintColorLight, // Cor dos ícones selecionados nas abas
  },
  dark: {
    text: '#c9c9c9ff', // Cor para o texto
    background: '#18243e', // Cor de fundo no modo escuro
    tint: tintColorDark, // Cor dos ícones e botões no modo escuro
    tabIconDefault: '#9CA3AF', // Cor padrão dos ícones nas abas
    tabIconSelected: tintColorDark, // Cor dos ícones selecionados nas abas
  },
};
