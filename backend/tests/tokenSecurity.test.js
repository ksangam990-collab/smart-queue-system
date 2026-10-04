import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { hashToken } from '../models/User.js';
import { issueTokens, generateToken } from '../utils/generateToken.js';

describe('Token Security & Rotation Suite', () => {
  const JWT_SECRET = 'test_secret_key_at_least_32_characters_long_for_unit_tests!';
  process.env.JWT_SECRET = JWT_SECRET;

  it('hashToken should produce a deterministic 64-character SHA-256 hex string', () => {
    const raw = 'abc123rawTokenForTesting';
    const hash1 = hashToken(raw);
    const hash2 = hashToken(raw);

    assert.equal(typeof hash1, 'string');
    assert.equal(hash1.length, 64);
    assert.equal(hash1, hash2);
  });

  it('hashToken should produce distinct hashes for distinct input tokens', () => {
    const hashA = hashToken('token_alpha_123');
    const hashB = hashToken('token_beta_123');

    assert.notEqual(hashA, hashB);
  });

  it('issueTokens should generate valid access token and hashed refresh token with cookies', async () => {
    const fakeUser = {
      _id: '507f1f77bcf86cd799439011',
      role: 'customer',
      refreshToken: null,
      refreshTokenExpire: null,
      async save() {
        return this;
      },
    };

    const cookies = {};
    const res = {
      cookie(name, val, opts) {
        cookies[name] = { val, opts };
      },
    };

    const result = await issueTokens(res, fakeUser);

    // 1. Return values
    assert.ok(result.accessToken, 'Access token must be returned');
    assert.ok(result.refreshToken, 'Refresh token must be returned');
    assert.equal(typeof result.refreshToken, 'string');

    // 2. Access token JWT payload verification
    const decoded = jwt.verify(result.accessToken, JWT_SECRET);
    assert.equal(decoded.id, fakeUser._id);
    assert.equal(decoded.role, 'customer');

    // 3. User object update
    assert.ok(fakeUser.refreshToken, 'User model should have refreshToken set');
    assert.equal(fakeUser.refreshToken, hashToken(result.refreshToken));
    assert.ok(fakeUser.refreshTokenExpire instanceof Date);
    assert.ok(fakeUser.refreshTokenExpire > new Date());

    // 4. Cookies
    assert.ok(cookies.token, 'token cookie must be set');
    assert.equal(cookies.token.opts.httpOnly, true);
    assert.equal(cookies.token.opts.maxAge, 15 * 60 * 1000);

    assert.ok(cookies.refreshToken, 'refreshToken cookie must be set');
    assert.equal(cookies.refreshToken.opts.httpOnly, true);
    assert.equal(cookies.refreshToken.opts.path, '/api/auth');
    assert.equal(cookies.refreshToken.opts.maxAge, 7 * 24 * 60 * 60 * 1000);
  });

  it('generateToken wrapper should generate a valid JWT access token', () => {
    const cookies = {};
    const res = {
      cookie(name, val, opts) {
        cookies[name] = { val, opts };
      },
    };

    const token = generateToken(res, 'user_id_999', 'admin');
    const decoded = jwt.verify(token, JWT_SECRET);

    assert.equal(decoded.id, 'user_id_999');
    assert.equal(decoded.role, 'admin');
    assert.equal(cookies.token.val, token);
    assert.equal(cookies.token.opts.httpOnly, true);
  });
});
