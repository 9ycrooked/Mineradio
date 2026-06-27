declare module "bun:test" {
  export function test(name: string, fn: () => void | Promise<void>): void;
  export function expect(actual: unknown): {
    toBe(expected: unknown): void;
  };
}

declare const process: {
  env: Record<string, string | undefined>;
};

declare const Bun: {
  serve(options: {
    hostname: string;
    port: number;
    fetch(request: Request): Response | Promise<Response>;
  }): {
    hostname: string;
    port: number;
  };
};
