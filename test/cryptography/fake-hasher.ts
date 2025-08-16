import { HashCompare } from '@/core/cryptography/hash-comparer';
import { HashGenerator } from '@/core/cryptography/hash-generator';

export class FakeHasher implements HashGenerator, HashCompare {
  // eslint-disable-next-line @typescript-eslint/require-await
  async hash(plain: string): Promise<string> {
    return plain.concat('-hashed');
  }

  compare(plain: string, hash: string): boolean {
    return plain.concat('-hashed') === hash;
  }
}
