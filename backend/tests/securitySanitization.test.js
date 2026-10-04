import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { safeRegex } from '../utils/escapeRegex.js';
import { safeMessage } from '../utils/safeError.js';

describe('Security Sanitization & Error Masking Suite', () => {
  describe('safeRegex', () => {
    it('should escape dangerous regex metacharacters preventing ReDoS', () => {
      const malicious = '(a+)+$';
      const regex = safeRegex(malicious);

      // The literal pattern must match itself rather than executing arbitrary repetition
      assert.ok(regex instanceof RegExp);
      assert.equal(regex.test('(a+)+$'), true);
      assert.equal(regex.test('aaaa'), false);
    });

    it('should escape brackets, dots, and braces', () => {
      const input = 'user.[0].name+test?';
      const regex = safeRegex(input);

      assert.equal(regex.test('user.[0].name+test?'), true);
      assert.equal(regex.test('user0name test'), false);
    });

    it('should match case-insensitively', () => {
      const regex = safeRegex('John.Doe');
      assert.equal(regex.test('john.doe'), true);
      assert.equal(regex.test('JOHN.DOE'), true);
    });
  });

  describe('safeMessage', () => {
    it('should return error message in development/test environments', () => {
      const origEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const customError = new Error('MongoCastError: Cast to ObjectId failed for value "xyz"');
      assert.equal(safeMessage(customError), 'MongoCastError: Cast to ObjectId failed for value "xyz"');

      process.env.NODE_ENV = origEnv;
    });

    it('should sanitize and mask error message in production environment', () => {
      const origEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const customError = new Error('Sensitive DB connection timeout at 10.0.0.4:27017');
      assert.equal(safeMessage(customError), 'Something went wrong. Please try again later.');

      process.env.NODE_ENV = origEnv;
    });
  });
});
