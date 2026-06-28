import { expect, test } from "bun:test";
import { createImageProxy, resolveImageProxy } from "./image-proxy";

async function jsonBody(response: Response): Promise<any> {
  return await response.json();
}

test("image proxy returns BAD_REQUEST envelope when url is missing or invalid", async () => {
  for (const target of ["", "   ", "not-a-url", "file:///C:/cover.jpg", "ftp://example.test/a.jpg"]) {
    const response = await resolveImageProxy({
      target,
      request: new Request("http://127.0.0.1/image-proxy")
    });

    expect(response.status).toBe(400);
    const body = await jsonBody(response);
    expect(body.error.code).toBe("BAD_REQUEST");
    expect(body.error.retryable).toBe(false);
  }
});

test("image proxy streams upstream image and forwards no cookie or auth request headers", async () => {
  let upstreamRequest: Request | undefined;
  const service = createImageProxy({
    fetch: async (request) => {
      upstreamRequest = request;
      return new Response("image-bytes", {
        status: 200,
        headers: {
          "content-type": "image/jpeg",
          "content-length": "11",
          "cache-control": "public, max-age=60",
          etag: '"cover"',
          "last-modified": "Sat, 27 Jun 2026 00:00:00 GMT",
          "set-cookie": "secret=1",
          "x-private": "hidden"
        }
      });
    }
  });

  const response = await service({
    target: "https://img.example.test/cover.jpg",
    request: new Request("http://127.0.0.1/image-proxy", {
      headers: {
        cookie: "session=secret",
        authorization: "Bearer secret",
        "user-agent": "unit-test"
      }
    })
  });

  expect(response.status).toBe(200);
  expect(await response.text()).toBe("image-bytes");
  expect(upstreamRequest?.url).toBe("https://img.example.test/cover.jpg");
  expect(upstreamRequest?.headers.get("cookie")).toBe(null);
  expect(upstreamRequest?.headers.get("authorization")).toBe(null);
  expect(upstreamRequest?.headers.get("user-agent")).toBe(null);
  expect(response.headers.get("content-type")).toBe("image/jpeg");
  expect(response.headers.get("content-length")).toBe("11");
  expect(response.headers.get("cache-control")).toBe("public, max-age=60");
  expect(response.headers.get("etag")).toBe('"cover"');
  expect(response.headers.get("last-modified")).toBe("Sat, 27 Jun 2026 00:00:00 GMT");
  expect(response.headers.get("access-control-allow-origin")).toBe("*");
  expect(response.headers.get("set-cookie")).toBe(null);
  expect(response.headers.get("x-private")).toBe(null);
});

test("image proxy rejects non-image upstream content", async () => {
  const service = createImageProxy({
    fetch: async () => new Response("html", {
      status: 200,
      headers: { "content-type": "text/html" }
    })
  });

  const response = await service({
    target: "https://img.example.test/cover",
    request: new Request("http://127.0.0.1/image-proxy")
  });

  expect(response.status).toBe(502);
  const body = await jsonBody(response);
  expect(body.error.code).toBe("UPSTREAM_IMAGE_PROXY");
  expect(body.error.retryable).toBe(true);
});
