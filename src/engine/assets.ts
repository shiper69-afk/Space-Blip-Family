import type { AssetBank, Manifest } from './types';

export class Assets implements AssetBank {
  private images = new Map<string, HTMLImageElement>();

  image(key: string): HTMLImageElement | undefined {
    return this.images.get(key);
  }

  load(manifest: Manifest, onProgress?: (fraction: number) => void): Promise<void> {
    const jobs = Object.entries(manifest.images ?? {}).filter(([key]) => !this.images.has(key));
    if (jobs.length === 0) {
      onProgress?.(1);
      return Promise.resolve();
    }
    let done = 0;
    onProgress?.(0);
    return Promise.all(
      jobs.map(
        ([key, url]) =>
          new Promise<void>((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
              this.images.set(key, image);
              done += 1;
              onProgress?.(done / jobs.length);
              resolve();
            };
            image.onerror = () => reject(new Error(`Failed to load ${key}`));
            image.src = url;
          }),
      ),
    ).then(() => undefined);
  }
}
