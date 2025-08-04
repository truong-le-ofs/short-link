# Low-Level Design (LLD)
## URL Shortener Platform

### Document Information
- **Version**: 1.0
- **Date**: 2025-01-04
- **Author**: Development Team
- **Status**: Implementation Ready

## 1. Detailed Component Design

### 1.1 Link Resolution Engine

```typescript
// supabase/functions/resolve-link/index.ts
interface LinkResolutionRequest {
  shortCode: string;
  userAgent?: string;
  ip?: string;
  referrer?: string;
}

interface LinkResolutionResponse {
  targetUrl: string;
  requiresPassword: boolean;
  passwordExpiresAt?: string;
  error?: string;
}

class LinkResolver {
  async resolve(request: LinkResolutionRequest): Promise<LinkResolutionResponse> {
    // 1. Fetch link from database
    const link = await this.fetchLink(request.shortCode);
    
    // 2. Validate link status
    this.validateLinkStatus(link);
    
    // 3. Check expiration and limits
    this.checkExpiration(link);
    this.checkClickLimits(link);
    
    // 4. Handle password protection
    if (link.password && !request.password) {
      return { requiresPassword: true, passwordExpiresAt: link.password_expires_at };
    }
    
    // 5. Apply scheduled URL changes
    const targetUrl = await this.applyScheduledChanges(link);
    
    // 6. Track analytics (async)
    this.trackAnalytics(link.id, request);
    
    // 7. Increment click counter
    this.incrementClickCount(link.id);
    
    return { targetUrl };
  }
}
```

### 1.2 Analytics Tracking System

```typescript
// lib/analytics.ts
interface AnalyticsEvent {
  linkId: string;
  ip: string;
  userAgent: string;
  referrer?: string;
  timestamp: Date;
}

class AnalyticsTracker {
  async track(event: AnalyticsEvent): Promise<void> {
    // Parse user agent for device info
    const deviceInfo = this.parseUserAgent(event.userAgent);
    
    // Resolve IP to geographic location
    const location = await this.resolveLocation(event.ip);
    
    // Store analytics record
    await supabase.from('analytics').insert({
      link_id: event.linkId,
      ip: event.ip,
      user_agent: event.userAgent,
      referrer: event.referrer,
      device: deviceInfo.device,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      country: location.country,
      city: location.city,
      clicked_at: event.timestamp
    });
    
    // Update real-time dashboard
    this.broadcastUpdate(event.linkId);
  }
  
  private parseUserAgent(userAgent: string): DeviceInfo {
    const parser = new UAParser(userAgent);
    return {
      device: parser.getDevice().type || 'desktop',
      browser: parser.getBrowser().name || 'unknown',
      os: parser.getOS().name || 'unknown'
    };
  }
}
```

### 1.3 Link Management Service

```typescript
// lib/linkService.ts
interface CreateLinkRequest {
  targetUrl: string;
  customCode?: string;
  password?: string;
  expiresAt?: Date;
  maxClicks?: number;
}

class LinkService {
  async createLink(userId: string, request: CreateLinkRequest): Promise<Link> {
    // Validate target URL
    await this.validateUrl(request.targetUrl);
    
    // Generate or validate short code
    const shortCode = request.customCode || await this.generateShortCode();
    await this.ensureUniqueCode(shortCode);
    
    // Hash password if provided
    const hashedPassword = request.password ? 
      await bcrypt.hash(request.password, 10) : null;
    
    // Create link record
    const { data, error } = await supabase
      .from('links')
      .insert({
        user_id: userId,
        short_code: shortCode,
        target_url: request.targetUrl,
        password: hashedPassword,
        expires_at: request.expiresAt,
        max_clicks: request.maxClicks
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create link: ${error.message}`);
    
    return data;
  }
  
  private async generateShortCode(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      const code = nanoid(6);
      const exists = await this.checkCodeExists(code);
      
      if (!exists) return code;
      attempts++;
    }
    
    throw new Error('Failed to generate unique short code');
  }
}
```

## 2. Database Schema Implementation

### 2.1 Table Definitions with Constraints

```sql
-- Links table with all constraints
CREATE TABLE links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  short_code TEXT UNIQUE NOT NULL CHECK (length(short_code) >= 4 AND length(short_code) <= 12),
  target_url TEXT NOT NULL CHECK (target_url ~ '^https?://'),
  password TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  password_expires_at TIMESTAMP WITH TIME ZONE,
  max_clicks INTEGER CHECK (max_clicks > 0),
  click_count INTEGER DEFAULT 0 CHECK (click_count >= 0),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure password expiry is after creation
  CONSTRAINT password_expiry_valid CHECK (
    password_expires_at IS NULL OR password_expires_at > created_at
  ),
  
  -- Ensure general expiry is in future
  CONSTRAINT expiry_in_future CHECK (
    expires_at IS NULL OR expires_at > created_at
  )
);

-- Indexes for optimal performance
CREATE INDEX CONCURRENTLY idx_links_user_id ON links(user_id);
CREATE INDEX CONCURRENTLY idx_links_short_code ON links(short_code);
CREATE INDEX CONCURRENTLY idx_links_active ON links(is_active) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_links_expires ON links(expires_at) WHERE expires_at IS NOT NULL;
```

### 2.2 Row Level Security Policies

```sql
-- Enable RLS
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Links policies
CREATE POLICY "users_own_links" ON links
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "public_link_resolution" ON links
  FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- Analytics policies  
CREATE POLICY "users_own_analytics" ON analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM links 
      WHERE links.id = analytics.link_id 
      AND links.user_id = auth.uid()
    )
  );

CREATE POLICY "public_analytics_insert" ON analytics
  FOR INSERT WITH CHECK (true);
```

### 2.3 Database Functions

```sql
-- Increment click count atomically
CREATE OR REPLACE FUNCTION increment_click_count(link_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE links 
  SET click_count = click_count + 1, updated_at = NOW()
  WHERE id = link_uuid AND is_active = true
  RETURNING click_count INTO new_count;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Link not found or inactive';
  END IF;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Get link with active schedule
CREATE OR REPLACE FUNCTION get_link_with_schedule(short_code_param TEXT)
RETURNS TABLE (
  id UUID,
  target_url TEXT,
  effective_url TEXT,
  password TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.target_url,
    COALESCE(s.target_url, l.target_url) as effective_url,
    l.password,
    l.expires_at,
    l.is_active
  FROM links l
  LEFT JOIN LATERAL (
    SELECT target_url
    FROM schedules
    WHERE link_id = l.id
      AND starts_at <= NOW()
      AND (ends_at IS NULL OR ends_at > NOW())
      AND is_active = true
    ORDER BY starts_at DESC
    LIMIT 1
  ) s ON true
  WHERE l.short_code = short_code_param;
END;
$$ LANGUAGE plpgsql;
```

## 3. Frontend Component Implementation

### 3.1 Link Creation Form

```typescript
// components/links/LinkForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const linkSchema = z.object({
  targetUrl: z.string().url('Please enter a valid URL'),
  customCode: z.string().optional(),
  password: z.string().optional(),
  expiresAt: z.string().optional(),
  maxClicks: z.number().min(1).optional()
});

type LinkFormData = z.infer<typeof linkSchema>;

export function LinkForm({ onSuccess }: { onSuccess: (link: Link) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema)
  });
  
  const onSubmit = async (data: LinkFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create link');
      }
      
      const link = await response.json();
      
      toast({
        title: 'Success',
        description: 'Short link created successfully!'
      });
      
      onSuccess(link);
      form.reset();
      
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...form.register('targetUrl')}
          placeholder="Enter URL to shorten"
          className="w-full"
        />
        {form.formState.errors.targetUrl && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.targetUrl.message}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          {...form.register('customCode')}
          placeholder="Custom code (optional)"
        />
        <Input
          {...form.register('password')}
          type="password"
          placeholder="Password (optional)"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          {...form.register('expiresAt')}
          type="datetime-local"
          placeholder="Expires at"
        />
        <Input
          {...form.register('maxClicks', { valueAsNumber: true })}
          type="number"
          placeholder="Max clicks"
          min="1"
        />
      </div>
      
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Creating...' : 'Create Short Link'}
      </Button>
    </form>
  );
}
```

### 3.2 Analytics Dashboard

```typescript
// components/analytics/AnalyticsDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';

interface AnalyticsData {
  totalClicks: number;
  uniqueVisitors: number;
  topCountries: Array<{ country: string; count: number }>;
  clicksOverTime: Array<{ date: string; clicks: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
}

export function AnalyticsDashboard({ linkId }: { linkId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadAnalytics();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`analytics:${linkId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analytics',
          filter: `link_id=eq.${linkId}`
        },
        () => {
          loadAnalytics(); // Refresh data on new clicks
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [linkId]);
  
  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/${linkId}`);
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="animate-pulse">Loading analytics...</div>;
  }
  
  if (!data) {
    return <div>No analytics data available</div>;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Total Clicks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{data.totalClicks}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Unique Visitors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{data.uniqueVisitors}</div>
        </CardContent>
      </Card>
      
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Clicks Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.clicksOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="clicks" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
```

## 4. API Implementation

### 4.1 Links API Routes

```typescript
// app/api/links/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { LinkService } from '@/lib/linkService';

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    const { data: links, error, count } = await supabase
      .from('links')
      .select(`
        *,
        analytics(count),
        schedules(*)
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({
      links,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const linkService = new LinkService();
    
    const link = await linkService.createLink(user.id, body);
    
    return NextResponse.json(link, { status: 201 });
    
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
```

## 5. Error Handling Implementation

### 5.1 Global Error Handler

```typescript
// lib/errorHandler.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (error: unknown) => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
      code: 'INTERNAL_ERROR'
    };
  }
  
  return {
    message: 'An unexpected error occurred',
    statusCode: 500,
    code: 'UNKNOWN_ERROR'
  };
};
```

## 6. Testing Implementation

### 6.1 Link Service Unit Tests

```typescript
// __tests__/linkService.test.ts
import { LinkService } from '@/lib/linkService';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase');

describe('LinkService', () => {
  let linkService: LinkService;
  
  beforeEach(() => {
    linkService = new LinkService();
    jest.clearAllMocks();
  });
  
  describe('createLink', () => {
    it('should create a link with valid data', async () => {
      const mockLink = {
        id: 'test-id',
        short_code: 'abc123',
        target_url: 'https://example.com',
        user_id: 'user-id'
      };
      
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockLink,
              error: null
            })
          })
        })
      });
      
      const result = await linkService.createLink('user-id', {
        targetUrl: 'https://example.com'
      });
      
      expect(result).toEqual(mockLink);
    });
    
    it('should throw error for invalid URL', async () => {
      await expect(
        linkService.createLink('user-id', {
          targetUrl: 'invalid-url'
        })
      ).rejects.toThrow('Invalid URL format');
    });
  });
});
```

---
*This LLD provides complete implementation details for all system components.*