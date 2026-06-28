import { fail, json } from "../http/envelope";

export type ImageProxyRequest = {
  target: string;
  request: Request;
};

export type ImageProxy = (input: ImageProxyRequest) => Promise<Response>;

export type ImageProxyDeps = {
  fetch?: (request: Request) => Promise<Response>;
};

const upstreamResponseHeaders = [
  "content-type",
  "content-length",
  "cache-control",
  "etag",
  "last-modified"
];

export function createImageProxy(deps: ImageProxyDeps = {}): ImageProxy {
  const fetcher = deps.fetch ?? fetch;

  return async function proxyImage(input: ImageProxyRequest): Promise<Response> {
    const parsed = parseTargetUrl(input.target);
    if (!parsed.ok) {
      return badRequest(parsed.message);
    }

    let upstream: Response;
    try {
      upstream = await fetcher(new Request(parsed.url, { method: "GET" }));
    } catch {
      return upstreamFailure("upstream image request failed");
    }

    if (!upstream.ok) {
      return upstreamFailure(`upstream image request returned ${upstream.status}`);
    }
    if (!isImageResponse(upstream)) {
      return upstreamFailure("upstream image request returned non-image content");
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeadersFrom(upstream)
    });
  };
}

export const resolveImageProxy = createImageProxy();

function parseTargetUrl(target: string): { ok: true; url: string } | { ok: false; message: string } {
  if (!target.trim()) {
    return { ok: false, message: "url required" };
  }

  try {
    const url = new URL(target);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { ok: false, message: "url must use http or https" };
    }
    return { ok: true, url: url.toString() };
  } catch {
    return { ok: false, message: "invalid url" };
  }
}

function isImageResponse(upstream: Response): boolean {
  const contentType = upstream.headers.get("content-type") ?? "";
  return /^image\//i.test(contentType);
}

function responseHeadersFrom(upstream: Response): Headers {
  const headers = new Headers({
    "access-control-allow-origin": "*"
  });
  for (const header of upstreamResponseHeaders) {
    const value = upstream.headers.get(header);
    if (value !== null) {
      headers.set(header, value);
    }
  }
  return headers;
}

function badRequest(message: string): Response {
  return json(
    fail({
      code: "BAD_REQUEST",
      message,
      retryable: false
    }),
    400
  );
}

function upstreamFailure(message: string): Response {
  return json(
    fail({
      code: "UPSTREAM_IMAGE_PROXY",
      message,
      retryable: true
    }),
    502
  );
}
