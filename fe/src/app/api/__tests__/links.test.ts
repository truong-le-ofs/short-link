import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '../links/route';

// Mock the external dependencies
jest.mock('@/lib/api-middleware', () => ({
  withMiddleware: jest.fn((handler) => handler),
  getValidatedBody: jest.fn(),
  errorResponse: jest.fn((message, status) => new Response(JSON.stringify({ error: message }), { status })),
  successResponse: jest.fn((data, status = 200) => new Response(JSON.stringify(data), { status })),
  apiForward: jest.fn(),
}));

const mockApiForward = jest.fn();
const mockGetValidatedBody = jest.fn();
const mockErrorResponse = jest.fn();
const mockSuccessResponse = jest.fn();

// Import the mocked functions
import { apiForward, getValidatedBody, errorResponse, successResponse } from '@/lib/api-middleware';

describe('/api/links API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    (apiForward as jest.Mock).mockImplementation(mockApiForward);
    (getValidatedBody as jest.Mock).mockImplementation(mockGetValidatedBody);
    (errorResponse as jest.Mock).mockImplementation(mockErrorResponse);
    (successResponse as jest.Mock).mockImplementation(mockSuccessResponse);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /api/links', () => {
    it('successfully fetches links from backend', async () => {
      const mockLinks = [
        {
          id: '1',
          short_code: 'abc123',
          original_url: 'https://example.com',
          title: 'Test Link',
          click_count: 5,
          user_id: 'user1',
          created_at: '2023-01-01T00:00:00Z',
        },
      ];

      const mockBackendResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockLinks),
      };

      mockApiForward.mockResolvedValue(mockBackendResponse);
      mockSuccessResponse.mockReturnValue(
        new Response(JSON.stringify(mockLinks), { status: 200 })
      );

      const request = new NextRequest('http://localhost:3000/api/links');
      const context = { authHeader: 'Bearer valid-token' };

      const response = await GET(request, context);
      
      expect(mockApiForward).toHaveBeenCalledWith('/api/links', {
        method: 'GET',
      }, 'Bearer valid-token');

      expect(mockSuccessResponse).toHaveBeenCalledWith(mockLinks);
      expect(response.status).toBe(200);
    });

    it('handles backend error responses', async () => {
      const mockBackendResponse = {
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({ error: 'Database error' }),
      };

      mockApiForward.mockResolvedValue(mockBackendResponse);
      mockErrorResponse.mockReturnValue(
        new Response(JSON.stringify({ error: 'Database error' }), { status: 500 })
      );

      const request = new NextRequest('http://localhost:3000/api/links');
      const context = { authHeader: 'Bearer valid-token' };

      const response = await GET(request, context);

      expect(mockErrorResponse).toHaveBeenCalledWith('Database error', 500);
      expect(response.status).toBe(500);
    });

    it('handles network errors', async () => {
      mockApiForward.mockRejectedValue(new Error('Network error'));
      mockErrorResponse.mockReturnValue(
        new Response(JSON.stringify({ error: 'Failed to fetch links' }), { status: 500 })
      );

      const request = new NextRequest('http://localhost:3000/api/links');
      const context = { authHeader: 'Bearer valid-token' };

      const response = await GET(request, context);

      expect(mockErrorResponse).toHaveBeenCalledWith('Failed to fetch links', 500);
      expect(response.status).toBe(500);
    });

    it('handles backend response without error message', async () => {
      const mockBackendResponse = {
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({}),
      };

      mockApiForward.mockResolvedValue(mockBackendResponse);
      mockErrorResponse.mockReturnValue(
        new Response(JSON.stringify({ error: 'Failed to fetch links' }), { status: 400 })
      );

      const request = new NextRequest('http://localhost:3000/api/links');
      const context = { authHeader: 'Bearer valid-token' };

      await GET(request, context);

      expect(mockErrorResponse).toHaveBeenCalledWith('Failed to fetch links', 400);
    });
  });

  describe('POST /api/links', () => {
    it('successfully creates a new link', async () => {
      const linkData = {
        original_url: 'https://example.com',
        short_code: 'custom123',
        title: 'Test Link',
        description: 'A test link',
      };

      const createdLink = {
        id: '1',
        ...linkData,
        user_id: 'user1',
        click_count: 0,
        created_at: '2023-01-01T00:00:00Z',
      };

      mockGetValidatedBody.mockReturnValue(linkData);

      const mockBackendResponse = {
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue(createdLink),
      };

      mockApiForward.mockResolvedValue(mockBackendResponse);
      mockSuccessResponse.mockReturnValue(
        new Response(JSON.stringify(createdLink), { status: 201 })
      );

      const request = new NextRequest('http://localhost:3000/api/links', {
        method: 'POST',
        body: JSON.stringify(linkData),
        headers: { 'Content-Type': 'application/json' },
      });
      const context = { authHeader: 'Bearer valid-token' };

      const response = await POST(request, context);

      expect(mockGetValidatedBody).toHaveBeenCalledWith(request);
      expect(mockApiForward).toHaveBeenCalledWith('/api/links', {
        method: 'POST',
        body: JSON.stringify(linkData),
      }, 'Bearer valid-token');

      expect(mockSuccessResponse).toHaveBeenCalledWith(createdLink, 201);
      expect(response.status).toBe(201);
    });

    it('handles validation errors from getValidatedBody', async () => {
      const validationError = new Error('Invalid URL format');
      mockGetValidatedBody.mockImplementation(() => {
        throw validationError;
      });

      mockErrorResponse.mockReturnValue(
        new Response(JSON.stringify({ error: 'Failed to create link' }), { status: 500 })
      );

      const request = new NextRequest('http://localhost:3000/api/links', {
        method: 'POST',
        body: JSON.stringify({ original_url: 'invalid-url' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const context = { authHeader: 'Bearer valid-token' };

      const response = await POST(request, context);

      expect(mockErrorResponse).toHaveBeenCalledWith('Failed to create link', 500);
      expect(response.status).toBe(500);
    });

    it('handles backend creation errors', async () => {
      const linkData = {
        original_url: 'https://example.com',
        short_code: 'taken-code',
      };

      mockGetValidatedBody.mockReturnValue(linkData);

      const mockBackendResponse = {
        ok: false,
        status: 409,
        json: jest.fn().mockResolvedValue({ error: 'Short code already exists' }),
      };

      mockApiForward.mockResolvedValue(mockBackendResponse);
      mockErrorResponse.mockReturnValue(
        new Response(JSON.stringify({ error: 'Short code already exists' }), { status: 409 })
      );

      const request = new NextRequest('http://localhost:3000/api/links', {
        method: 'POST',
        body: JSON.stringify(linkData),
        headers: { 'Content-Type': 'application/json' },
      });
      const context = { authHeader: 'Bearer valid-token' };

      const response = await POST(request, context);

      expect(mockErrorResponse).toHaveBeenCalledWith('Short code already exists', 409);
      expect(response.status).toBe(409);
    });

    it('handles network errors during creation', async () => {
      const linkData = {
        original_url: 'https://example.com',
      };

      mockGetValidatedBody.mockReturnValue(linkData);
      mockApiForward.mockRejectedValue(new Error('Network timeout'));
      mockErrorResponse.mockReturnValue(
        new Response(JSON.stringify({ error: 'Failed to create link' }), { status: 500 })
      );

      const request = new NextRequest('http://localhost:3000/api/links', {
        method: 'POST',
        body: JSON.stringify(linkData),
        headers: { 'Content-Type': 'application/json' },
      });
      const context = { authHeader: 'Bearer valid-token' };

      const response = await POST(request, context);

      expect(mockErrorResponse).toHaveBeenCalledWith('Failed to create link', 500);
      expect(response.status).toBe(500);
    });

    it('handles malformed backend response', async () => {
      const linkData = {
        original_url: 'https://example.com',
      };

      mockGetValidatedBody.mockReturnValue(linkData);

      const mockBackendResponse = {
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({}), // No error message
      };

      mockApiForward.mockResolvedValue(mockBackendResponse);
      mockErrorResponse.mockReturnValue(
        new Response(JSON.stringify({ error: 'Failed to create link' }), { status: 400 })
      );

      const request = new NextRequest('http://localhost:3000/api/links', {
        method: 'POST',
        body: JSON.stringify(linkData),
        headers: { 'Content-Type': 'application/json' },
      });
      const context = { authHeader: 'Bearer valid-token' };

      await POST(request, context);

      expect(mockErrorResponse).toHaveBeenCalledWith('Failed to create link', 400);
    });
  });

  describe('Error handling', () => {
    it('logs errors to console', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      mockApiForward.mockRejectedValue(new Error('Test error'));
      mockErrorResponse.mockReturnValue(
        new Response(JSON.stringify({ error: 'Failed to fetch links' }), { status: 500 })
      );

      const request = new NextRequest('http://localhost:3000/api/links');
      const context = { authHeader: 'Bearer valid-token' };

      await GET(request, context);

      expect(consoleSpy).toHaveBeenCalledWith('Links API GET error:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });
});