import { translateMany, translateFile, MAX_MB, MAX_BYTES } from '../lib/translate';

// Mock do módulo api
jest.mock('../lib/api', () => ({
  authFetch: jest.fn(),
}));

// Import após o mock
const { authFetch } = require('../lib/api');
const mockAuthFetch = authFetch as jest.MockedFunction<typeof authFetch>;

describe('translate.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('translateFile', () => {
    it('deve traduzir arquivo com sucesso', async () => {
      // Arrange
      const mockFile = new File(['conteúdo'], 'teste.pdf', { type: 'application/pdf' });
      const mockResponse = {
        id: '123',
        name: 'teste.pdf',
        translatedName: 'teste_en.pdf',
        targetLang: 'en',
        downloadUrl: '/files/teste_en.pdf',
      };

      mockAuthFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockResponse),
      } as Response);

      // Act
      const result = await translateFile(mockFile, 'en');

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockAuthFetch).toHaveBeenCalledWith('/translate-file', {
        method: 'POST',
        body: expect.any(FormData),
      });
    });

    it('deve rejeitar arquivo maior que o limite', async () => {
      // Arrange - arquivo de 51 MB
      const largeSize = (MAX_MB + 1) * 1024 * 1024;
      const mockFile = new File(['x'.repeat(largeSize)], 'grande.pdf', { 
        type: 'application/pdf' 
      });
      Object.defineProperty(mockFile, 'size', { value: largeSize });

      // Act & Assert
      await expect(translateFile(mockFile, 'en')).rejects.toThrow(
        `"grande.pdf" é muito grande. Limite ${MAX_MB} MB.`
      );
      expect(mockAuthFetch).not.toHaveBeenCalled();
    });

    it('deve tratar erro 401 (não autenticado)', async () => {
      // Arrange
      const mockFile = new File(['conteúdo'], 'teste.pdf', { type: 'application/pdf' });
      
      mockAuthFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      } as Response);

      // Act & Assert
      await expect(translateFile(mockFile, 'en')).rejects.toThrow(
        'Sessão expirada. Faça login novamente.'
      );
    });

    it('deve tratar erro 413 (arquivo muito grande)', async () => {
      // Arrange
      const mockFile = new File(['conteúdo'], 'grande.pdf', { type: 'application/pdf' });
      
      mockAuthFetch.mockResolvedValueOnce({
        ok: false,
        status: 413,
        text: async () => 'Payload Too Large',
      } as Response);

      // Act & Assert
      await expect(translateFile(mockFile, 'en')).rejects.toThrow(
        `"grande.pdf" excede ${MAX_MB} MB (413).`
      );
    });
  });

  describe('translateMany', () => {
    it('deve traduzir múltiplos arquivos com sucesso', async () => {
      // Arrange
      const mockFiles = [
        new File(['conteúdo1'], 'arquivo1.pdf', { type: 'application/pdf' }),
        new File(['conteúdo2'], 'arquivo2.pdf', { type: 'application/pdf' }),
      ];

      mockAuthFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ id: '1', downloadUrl: '/files/arquivo1_en.pdf' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ id: '2', downloadUrl: '/files/arquivo2_en.pdf' }),
        } as Response);

      const onProgress = jest.fn();

      // Act
      const results = await translateMany(mockFiles, 'en', onProgress);

      // Assert
      expect(results).toHaveLength(2);
      expect(results[0]).toMatchObject({ name: 'arquivo1.pdf', ok: true });
      expect(results[1]).toMatchObject({ name: 'arquivo2.pdf', ok: true });
      expect(onProgress).toHaveBeenCalledTimes(2);
      expect(onProgress).toHaveBeenCalledWith(1, 2, 'ok');
      expect(onProgress).toHaveBeenCalledWith(2, 2, 'ok');
    });

    it('deve continuar traduzindo mesmo com falha em um arquivo', async () => {
      // Arrange
      const mockFiles = [
        new File(['conteúdo1'], 'sucesso.pdf', { type: 'application/pdf' }),
        new File(['conteúdo2'], 'falha.pdf', { type: 'application/pdf' }),
        new File(['conteúdo3'], 'sucesso2.pdf', { type: 'application/pdf' }),
      ];

      mockAuthFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ id: '1', downloadUrl: '/files/sucesso_en.pdf' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: async () => JSON.stringify({ message: 'Erro no servidor' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ id: '3', downloadUrl: '/files/sucesso2_en.pdf' }),
        } as Response);

      const onProgress = jest.fn();

      // Act
      const results = await translateMany(mockFiles, 'en', onProgress);

      // Assert
      expect(results).toHaveLength(3);
      expect(results[0]).toMatchObject({ name: 'sucesso.pdf', ok: true });
      expect(results[1]).toMatchObject({ name: 'falha.pdf', ok: false, error: 'Erro no servidor' });
      expect(results[2]).toMatchObject({ name: 'sucesso2.pdf', ok: true });
      
      expect(onProgress).toHaveBeenCalledTimes(3);
      expect(onProgress).toHaveBeenCalledWith(2, 3, 'erro', 'Erro no servidor');
    });

    it('deve chamar onProgress corretamente durante tradução', async () => {
      // Arrange
      const mockFile = new File(['conteúdo'], 'teste.pdf', { type: 'application/pdf' });
      
      mockAuthFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ id: '1' }),
      } as Response);

      const onProgress = jest.fn();

      // Act
      await translateMany([mockFile], 'pt', onProgress);

      // Assert
      expect(onProgress).toHaveBeenCalledWith(1, 1, 'ok');
    });
  });

  describe('Constantes', () => {
    it('MAX_MB deve ser 50', () => {
      expect(MAX_MB).toBe(50);
    });

    it('MAX_BYTES deve ser calculado corretamente', () => {
      expect(MAX_BYTES).toBe(50 * 1024 * 1024);
    });
  });
});
