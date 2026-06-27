export type VisualEngineSnapshot = {
  preset: string;
  playing: boolean;
};

export type VisualEngine = {
  update(snapshot: VisualEngineSnapshot): void;
  resize(size: { width: number; height: number }): void;
  dispose(): void;
};

export function createVisualEngine(): VisualEngine {
  return {
    update() {},
    resize() {},
    dispose() {}
  };
}
