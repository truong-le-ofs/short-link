import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LinkForm } from '../link-form';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

// Set environment variables for tests
process.env.NEXT_PUBLIC_SHORT_URL_BASE = 'http://localhost:3000';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

// Mock the hooks
jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(),
}));
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

const mockApiCall = jest.fn();
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

describe('LinkForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      apiCall: mockApiCall,
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', email: 'test@example.com' },
      login: jest.fn(),
      logout: jest.fn(),
    });

    mockUseToast.mockReturnValue({
      toast: {
        success: mockToastSuccess,
        error: mockToastError,
      },
    });

    // Mock clipboard
    (navigator.clipboard.writeText as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Form Rendering', () => {
    it('renders create form with all required fields', () => {
      render(<LinkForm />);
      
      expect(screen.getByRole('heading', { name: /create short link/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/original url/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/custom short code/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create link/i })).toBeInTheDocument();
    });

    it('renders edit form when editingLink is provided', () => {
      const editingLink = {
        id: '1',
        short_code: 'test-code',
        original_url: 'https://example.com',
        title: 'Test Link',
        description: 'Test Description',
        user_id: '1',
        click_count: 0,
        created_at: '2023-01-01',
        expires_at: '2023-12-31',
        max_clicks: 100,
      };

      render(<LinkForm editingLink={editingLink} />);
      
      expect(screen.getByRole('heading', { name: /edit link/i })).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test-code')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update link/i })).toBeInTheDocument();
    });

    it('shows advanced options when toggled', async () => {
      const user = userEvent.setup();
      render(<LinkForm />);
      
      const advancedToggle = screen.getByRole('button', { name: /advanced options/i });
      await user.click(advancedToggle);
      
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/expiry date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/maximum clicks/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for empty required fields', async () => {
      const user = userEvent.setup();
      render(<LinkForm />);
      
      const submitButton = screen.getByRole('button', { name: /create link/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument();
      });
    });

    it('validates URL format', async () => {
      const user = userEvent.setup();
      render(<LinkForm />);
      
      const urlInput = screen.getByLabelText(/original url/i);
      await user.type(urlInput, 'invalid-url');
      
      const submitButton = screen.getByRole('button', { name: /create link/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument();
      });
    });

    it('validates password confirmation when password is set', async () => {
      const user = userEvent.setup();
      render(<LinkForm />);
      
      // Open advanced options
      const advancedToggle = screen.getByRole('button', { name: /advanced options/i });
      await user.click(advancedToggle);
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'different');
      
      const submitButton = screen.getByRole('button', { name: /create link/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('validates custom short code length', async () => {
      const user = userEvent.setup();
      render(<LinkForm />);
      
      const shortCodeInput = screen.getByLabelText(/custom short code/i);
      await user.type(shortCodeInput, 'ab'); // Too short
      
      const submitButton = screen.getByRole('button', { name: /create link/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/custom code must be at least 3 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Custom Code Availability', () => {
    it('checks custom code availability when valid code is entered', async () => {
      const user = userEvent.setup();
      mockApiCall.mockResolvedValue({
        data: { available: true },
        success: true,
      });

      render(<LinkForm />);
      
      const shortCodeInput = screen.getByLabelText(/custom short code/i);
      await user.type(shortCodeInput, 'available-code');
      await user.tab(); // Trigger blur event
      
      await waitFor(() => {
        expect(mockApiCall).toHaveBeenCalledWith('/api/links/check/available-code');
      });
    });

    it('shows error when custom code is not available', async () => {
      const user = userEvent.setup();
      mockApiCall.mockResolvedValue({
        data: { available: false },
        success: true,
      });

      render(<LinkForm />);
      
      const shortCodeInput = screen.getByLabelText(/custom short code/i);
      await user.type(shortCodeInput, 'taken-code');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/this custom code is already taken/i)).toBeInTheDocument();
      });
    });

    it('does not check availability for editing same link code', async () => {
      const editingLink = {
        id: '1',
        short_code: 'existing-code',
        original_url: 'https://example.com',
        title: '',
        description: '',
        user_id: '1',
        click_count: 0,
        created_at: '2023-01-01',
      };

      render(<LinkForm editingLink={editingLink} />);
      
      // Code availability should be true without API call
      expect(mockApiCall).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('creates a new link successfully', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();
      const createdLink = {
        id: '1',
        short_code: 'abc123',
        original_url: 'https://example.com',
        title: '',
        description: '',
        user_id: '1',
        click_count: 0,
        created_at: '2023-01-01',
      };

      mockApiCall.mockResolvedValue({
        data: createdLink,
        success: true,
      });

      render(<LinkForm onSuccess={mockOnSuccess} />);
      
      const urlInput = screen.getByLabelText(/original url/i);
      await user.type(urlInput, 'https://example.com');
      
      const submitButton = screen.getByRole('button', { name: /create link/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockApiCall).toHaveBeenCalledWith('/api/links', {
          method: 'POST',
          body: JSON.stringify({
            original_url: 'https://example.com',
            short_code: undefined,
            title: undefined,
            description: undefined,
            password: undefined,
            expires_at: undefined,
            max_clicks: undefined,
          }),
        });
      });

      expect(mockToastSuccess).toHaveBeenCalledWith(
        'Link created successfully!',
        'Your shortened link is ready.'
      );
      expect(mockOnSuccess).toHaveBeenCalledWith(createdLink);
    });

    it('updates an existing link successfully', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();
      const editingLink = {
        id: '1',
        short_code: 'existing',
        original_url: 'https://old-example.com',
        title: 'Old Title',
        description: 'Old Description',
        user_id: '1',
        click_count: 5,
        created_at: '2023-01-01',
      };

      const updatedLink = {
        ...editingLink,
        original_url: 'https://new-example.com',
        title: 'New Title',
      };

      mockApiCall.mockResolvedValue({
        data: updatedLink,
        success: true,
      });

      render(<LinkForm editingLink={editingLink} onSuccess={mockOnSuccess} />);
      
      const urlInput = screen.getByDisplayValue('https://old-example.com');
      await user.clear(urlInput);
      await user.type(urlInput, 'https://new-example.com');
      
      const submitButton = screen.getByRole('button', { name: /update link/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockApiCall).toHaveBeenCalledWith('/api/links/1', {
          method: 'PUT',
          body: expect.stringContaining('https://new-example.com'),
        });
      });

      expect(mockToastSuccess).toHaveBeenCalledWith(
        'Link updated!',
        'Your link has been updated.'
      );
      expect(mockOnSuccess).toHaveBeenCalledWith(updatedLink);
    });

    it('handles API errors gracefully', async () => {
      const user = userEvent.setup();
      const apiError = new Error('Failed to create link');
      mockApiCall.mockRejectedValue(apiError);

      render(<LinkForm />);
      
      const urlInput = screen.getByLabelText(/original url/i);
      await user.type(urlInput, 'https://example.com');
      
      const submitButton = screen.getByRole('button', { name: /create link/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Error', 'Failed to create link');
      });
    });

    it('disables form during submission', async () => {
      const user = userEvent.setup();
      // Mock a slow API call
      mockApiCall.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      render(<LinkForm />);
      
      const urlInput = screen.getByLabelText(/original url/i);
      const submitButton = screen.getByRole('button', { name: /create link/i });
      
      await user.type(urlInput, 'https://example.com');
      await user.click(submitButton);
      
      // Form should be disabled during submission
      expect(urlInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent(/creating/i);
    });
  });

  describe('Generated Link Display', () => {
    it('shows generated link after successful creation', async () => {
      const user = userEvent.setup();
      const createdLink = {
        id: '1',
        short_code: 'abc123',
        original_url: 'https://example.com',
        title: '',
        description: '',
        user_id: '1',
        click_count: 0,
        created_at: '2023-01-01',
      };

      mockApiCall.mockResolvedValue({
        data: createdLink,
        success: true,
      });

      render(<LinkForm />);
      
      const urlInput = screen.getByLabelText(/original url/i);
      await user.type(urlInput, 'https://example.com');
      
      const submitButton = screen.getByRole('button', { name: /create link/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('http://localhost:3000/abc123')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
      });
    });

    it('copies generated link to clipboard', async () => {
      const user = userEvent.setup();
      const createdLink = {
        id: '1',
        short_code: 'abc123',
        original_url: 'https://example.com',
        title: '',
        description: '',
        user_id: '1',
        click_count: 0,
        created_at: '2023-01-01',
      };

      mockApiCall.mockResolvedValue({
        data: createdLink,
        success: true,
      });

      render(<LinkForm />);
      
      const urlInput = screen.getByLabelText(/original url/i);
      await user.type(urlInput, 'https://example.com');
      
      const submitButton = screen.getByRole('button', { name: /create link/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
      });

      const copyButton = screen.getByRole('button', { name: /copy link/i });
      await user.click(copyButton);
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost:3000/abc123');
      expect(mockToastSuccess).toHaveBeenCalledWith('Copied to clipboard!');
    });
  });
});