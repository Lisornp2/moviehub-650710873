import { apiFetch, login, postReview } from './backend';

function fakeResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  };
}

beforeEach(() => {
  global.fetch = jest.fn();
});

// ข้อที่ 1
test('GET ธรรมดา: ไม่มี body ไม่มี Authorization และคืน object ที่แปลงแล้ว', async () => {
  fetch.mockResolvedValue(fakeResponse(200, { items: [{ id: 1 }] }));

  const data = await apiFetch('/api/movies');

  expect(data).toEqual({ items: [{ id: 1 }] });
  const [url, options] = fetch.mock.calls[0];
  expect(url).toBe('/api/movies');
  expect(options.method).toBe('GET');
  expect(options.body).toBeUndefined();
  expect(options.headers.Authorization).toBeUndefined();
});

// ข้อที่ 2
test('login สำเร็จ ต้องส่ง POST ไป /api/auth/login พร้อม email และ password', async () => {
  fetch.mockResolvedValue(fakeResponse(200, { token: 'jwt123' }));

  const data = await login('a@b.c', 'pass123');

  expect(data).toEqual({ token: 'jwt123' });
  const [url, options] = fetch.mock.calls[0];
  expect(url).toBe('/api/auth/login');
  expect(options.method).toBe('POST');
  expect(options.body).toBe(JSON.stringify({ email: 'a@b.c', password: 'pass123' }));
});

// ข้อที่ 3
test('มี token ต้องแนบ Authorization แบบ Bearer และ body ต้องเป็นข้อความ JSON', async () => {
  fetch.mockResolvedValue(fakeResponse(201, { id: 7 }));

  await postReview(969681, 'สนุกมาก ฉากแอ็กชันดี', 'abc123');

  const [url, options] = fetch.mock.calls[0];
  expect(url).toBe('/api/movies/969681/reviews');
  expect(options.method).toBe('POST');
  expect(options.headers.Authorization).toBe('Bearer abc123');
  expect(options.headers['Content-Type']).toBe('application/json');
  expect(options.body).toBe(JSON.stringify({ text: 'สนุกมาก ฉากแอ็กชันดี' }));
});

// ข้อที่ 4
test('204 คืน null โดยไม่เรียก res.json()', async () => {
  const res = fakeResponse(204, null);
  res.json = jest.fn();
  fetch.mockResolvedValue(res);

  const data = await apiFetch('/api/me/wishlist/1', { method: 'DELETE', token: 'abc' });

  expect(data).toBeNull();
  expect(res.json).not.toHaveBeenCalled();
});

// ข้อที่ 5
test('ไม่ใช่ 2xx ต้องโยน Error ที่มีข้อความจาก server และเลข status', async () => {
  fetch.mockResolvedValue(fakeResponse(401, { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }));

  await expect(login('a@b.c', 'wrong')).rejects.toThrow('อีเมลหรือรหัสผ่านไม่ถูกต้อง');

  const err = await login('a@b.c', 'wrong').catch((e) => e);
  expect(err.status).toBe(401);
});