import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validatePassword } from '../utils/passwordPolicy.js';

describe('Password Policy Validation Suite', () => {
  it('should reject non-string input or empty passwords', () => {
    assert.equal(validatePassword(null), 'Password is required.');
    assert.equal(validatePassword(undefined), 'Password is required.');
    assert.equal(validatePassword(12345678), 'Password is required.');
  });

  it('should reject passwords shorter than 8 characters', () => {
    assert.equal(validatePassword('Pass1'), 'Password must be at least 8 characters.');
    assert.equal(validatePassword('Abc1234'), 'Password must be at least 8 characters.');
  });

  it('should reject passwords exceeding 72 bytes (bcrypt truncation ceiling)', () => {
    const longPw = 'A1' + 'a'.repeat(75);
    assert.equal(validatePassword(longPw), 'Password must be at most 72 characters.');
  });

  it('should reject passwords missing numbers or letters', () => {
    assert.equal(validatePassword('abcdefghij'), 'Password must contain at least one letter and one number.');
    assert.equal(validatePassword('1234567890'), 'Password must contain at least one letter and one number.');
  });

  it('should reject common insecure passwords', () => {
    assert.equal(validatePassword('password123'), 'That password is too common. Please choose another.');
    assert.equal(validatePassword('slotly123'), 'That password is too common. Please choose another.');
    assert.equal(validatePassword('admin123'), 'That password is too common. Please choose another.');
  });

  it('should reject passwords containing the user email username (>=4 chars)', () => {
    const err = validatePassword('johnsmith99!', { email: 'johnsmith@example.com' });
    assert.equal(err, 'Password must not contain your email name.');
  });

  it('should accept strong, compliant passwords', () => {
    assert.equal(validatePassword('SecureP@ssw0rd!2026', { email: 'user@example.com' }), null);
    assert.equal(validatePassword('K9#mQ!vL2$xR', { email: 'test@slotly.io' }), null);
  });
});
