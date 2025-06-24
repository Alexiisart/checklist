import { Injectable } from '@angular/core';

/**
 * Servicio para generar identificadores únicos universales (UUIDs)
 * Utiliza la API nativa del navegador crypto.randomUUID() cuando está disponible,
 * con un fallback robusto para casos donde no esté disponible
 */
@Injectable({
  providedIn: 'root',
})
export class UuidService {
  private counter = 0;
  private readonly usedIds = new Set<string>();

  /**
   * Genera un UUID completamente único
   * @returns Un UUID único garantizado
   */
  generateUniqueId(): string {
    let uuid: string;

    // Intentar usar la API nativa del navegador primero
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      uuid = crypto.randomUUID();
    } else {
      // Fallback para navegadores que no soportan crypto.randomUUID
      uuid = this.generateUUIDFallback();
    }

    // Verificación adicional para garantizar unicidad absoluta
    while (this.usedIds.has(uuid)) {
      uuid = this.generateUUIDFallback();
    }

    this.usedIds.add(uuid);
    return uuid;
  }

  /**
   * Genera un ID numérico único a partir de un UUID
   * Para compatibilidad con código existente que espera números
   * @returns Un ID numérico único
   */
  generateNumericId(): number {
    const uuid = this.generateUniqueId();
    // Convertir parte del UUID a número
    const numericPart = uuid.replace(/-/g, '').substring(0, 15);
    return parseInt(numericPart, 16);
  }

  /**
   * Fallback para generar UUID cuando crypto.randomUUID no está disponible
   * Implementación basada en el estándar RFC 4122
   */
  private generateUUIDFallback(): string {
    this.counter++;

    // Obtener timestamp de alta precisión
    const timestamp = Date.now();
    const performanceTime = Math.floor(performance.now() * 10000);
    const counter = this.counter;

    // Generar partes aleatorias adicionales
    const random1 = Math.floor(Math.random() * 0xffffffff);
    const random2 = Math.floor(Math.random() * 0xffffffff);
    const random3 = Math.floor(Math.random() * 0xffffffff);

    // Formato UUID v4 modificado para garantizar unicidad
    const part1 = (timestamp % 0xffffffff).toString(16).padStart(8, '0');
    const part2 = (performanceTime % 0xffff).toString(16).padStart(4, '0');
    const part3 = (counter % 0xfff | 0x4000).toString(16).padStart(4, '0'); // Version 4
    const part4 = (random1 % 0x3fff | 0x8000).toString(16).padStart(4, '0'); // Variant
    const part5 =
      random2.toString(16).padStart(8, '0') +
      random3.toString(16).padStart(4, '0');

    return `${part1}-${part2}-${part3}-${part4}-${part5}`;
  }

  /**
   * Limpia el caché de IDs usados (para optimización de memoria)
   * Se puede llamar periódicamente si se generan muchos IDs
   */
  clearUsedIdsCache(): void {
    this.usedIds.clear();
  }

  /**
   * Retorna estadísticas del servicio
   */
  getStats(): { totalGenerated: number; cacheSize: number } {
    return {
      totalGenerated: this.counter,
      cacheSize: this.usedIds.size,
    };
  }
}
