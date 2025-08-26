import { I18nService } from 'nestjs-i18n';

export class FakeI18nService implements Partial<I18nService> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  t(key: string, options?: any): any {
    // Mock simples que retorna a chave como valor
    // Você pode personalizar isso para retornar valores específicos se necessário
    return key;
  }

  // Implementar outros métodos necessários se precisar
  translate(key: string, options?: any): any {
    return this.t(key, options);
  }
}
