import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, register } from '../../api_calls/auth';
import { server } from '../utils/mocks/server';
import { http, HttpResponse } from 'msw';

describe('Authentication API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    server.resetHandlers(); // Ensure clean handlers for each test
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // MSW will handle this with the default handler
      const result = await login({ email: 'test@example.com', password: 'password' });

      expect(result.success).toBe(true);
      expect(result.data.token).toBe('mock-jwt-token');
      expect(localStorage.getItem('token')).toBe('mock-jwt-token');
    });

    it('should handle login failure', async () => {
      // Override MSW handler for this test
      server.use(
        http.post('/auth/login', () => {
          return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        })
      );

      const result = await login({ email: 'wrong@example.com', password: 'wrongpass' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should handle network errors', async () => {
      // Override MSW handler to simulate network error
      server.use(
        http.post('http://localhost:3000/api/auth/login', () => {
          return HttpResponse.error();
        }),
        http.post('/auth/login', () => {
          return HttpResponse.error();
        })
      );

      await expect(login({ email: 'test@example.com', password: 'password' })).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const result = await register({ name: 'New User', email: 'newuser@example.com', password: 'password123' });

      expect(result.success).toBe(true);
      expect(result.data.user.name).toBe('New User');
    });

    it('should handle registration failure', async () => {
      // Override MSW handler for this test
      server.use(
        http.post('/auth/register', () => {
          return HttpResponse.json({ message: 'Email already exists' }, { status: 400 });
        })
      );

      const result = await register({ name: 'Test', email: 'existing@example.com', password: 'password' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Email already exists');
    });
  });
});