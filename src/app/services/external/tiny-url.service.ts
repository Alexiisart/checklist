import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/**
 * Servicio para acortar URLs usando TinyURL API
 */
@Injectable({
  providedIn: 'root',
})
export class TinyUrlService {
  private readonly TINYURL_API = 'https://tinyurl.com/api-create.php';

  constructor(private http: HttpClient) {}

  /**
   * Acorta una URL usando TinyURL
   * @param longUrl URL larga a acortar
   * @returns Promise con la URL acortada o null si hay error
   */
  async shortenUrl(longUrl: string): Promise<string | null> {
    try {
      // Validar longitud antes de enviar
      if (longUrl.length > 65536) {
        console.error('URL excede el límite de TinyURL');
        return null;
      }

      // Preparar parámetros para TinyURL
      const params = new URLSearchParams({
        url: longUrl,
        alias: '', // Sin alias personalizado
      });

      // Hacer petición a TinyURL
      const response = await firstValueFrom(
        this.http.get(`${this.TINYURL_API}?${params.toString()}`, {
          responseType: 'text',
        })
      );

      // Validar respuesta
      if (this.isValidTinyUrl(response)) {
        return response.trim();
      }

      console.error('Respuesta inválida de TinyURL:', response);
      return null;
    } catch (error) {
      console.error('Error acortando URL con TinyURL:', error);
      return null;
    }
  }

  /**
   * Valida si la respuesta de TinyURL es una URL válida
   * @param response Respuesta de la API
   * @returns true si es válida, false si no
   */
  private isValidTinyUrl(response: string): boolean {
    if (!response || typeof response !== 'string') {
      return false;
    }

    const trimmed = response.trim();

    // TinyURL devuelve "Error" si hay problemas
    if (trimmed.toLowerCase().includes('error')) {
      return false;
    }

    // Validar que sea una URL de TinyURL válida
    try {
      const url = new URL(trimmed);
      return url.hostname === 'tinyurl.com' && url.pathname.length > 1;
    } catch {
      return false;
    }
  }

  /**
   * Verifica si TinyURL está disponible (método de prueba)
   * @returns Promise<boolean> indicando si el servicio está disponible
   */
  async isServiceAvailable(): Promise<boolean> {
    try {
      // Probar con una URL simple
      const testUrl = 'https://www.google.com';
      const result = await this.shortenUrl(testUrl);
      return result !== null;
    } catch {
      return false;
    }
  }
}
