import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { canAccessDepartment, isValidId } from '../utils/queueAccess.js';
import { authorize } from '../middleware/authMiddleware.js';

describe('Authorization & Department Access Control Suite', () => {
  const deptA = '507f1f77bcf86cd799439011';
  const deptB = '507f1f77bcf86cd799439022';

  describe('canAccessDepartment', () => {
    it('should grant access to admin for any department', () => {
      const admin = { role: 'admin' };
      assert.equal(canAccessDepartment(admin, deptA), true);
      assert.equal(canAccessDepartment(admin, deptB), true);
    });

    it('should grant access to staff only for their assigned department', () => {
      const staffA = { role: 'staff', department: deptA };
      assert.equal(canAccessDepartment(staffA, deptA), true);
      assert.equal(canAccessDepartment(staffA, deptB), false);
    });

    it('should deny access to staff without an assigned department', () => {
      const unassignedStaff = { role: 'staff', department: null };
      assert.equal(canAccessDepartment(unassignedStaff, deptA), false);
    });

    it('should deny access to customer accounts', () => {
      const customer = { role: 'customer', department: deptA };
      assert.equal(canAccessDepartment(customer, deptA), false);
    });

    it('should deny access when user or department is falsy', () => {
      assert.equal(canAccessDepartment(null, deptA), false);
      assert.equal(canAccessDepartment({ role: 'admin' }, null), false);
    });
  });

  describe('authorize middleware', () => {
    it('should call next() if user role matches allowed roles', () => {
      const middleware = authorize('admin', 'staff');
      const req = { user: { role: 'admin' } };
      const res = {};
      let nextCalled = false;

      middleware(req, res, () => {
        nextCalled = true;
      });

      assert.equal(nextCalled, true);
    });

    it('should return 403 Forbidden if user role is not permitted', () => {
      const middleware = authorize('admin');
      const req = { user: { role: 'customer' } };
      let statusCode = null;
      let jsonBody = null;

      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(data) {
          jsonBody = data;
          return this;
        },
      };

      let nextCalled = false;
      middleware(req, res, () => {
        nextCalled = true;
      });

      assert.equal(nextCalled, false);
      assert.equal(statusCode, 403);
      assert.equal(jsonBody.success, false);
      assert.match(jsonBody.message, /Access denied/i);
    });
  });

  describe('isValidId', () => {
    it('should accept valid 24-character hexadecimal MongoDB ObjectIds', () => {
      assert.equal(isValidId('507f1f77bcf86cd799439011'), true);
      assert.equal(isValidId('6ac26578559337430f12f19e'), true);
    });

    it('should reject invalid or non-string object IDs', () => {
      assert.equal(isValidId('invalid-id'), false);
      assert.equal(isValidId(12345), false);
      assert.equal(isValidId(null), false);
      assert.equal(isValidId('507f1f77bcf86cd79943901z'), false);
    });
  });
});
