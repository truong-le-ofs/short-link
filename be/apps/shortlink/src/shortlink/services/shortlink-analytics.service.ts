import { Injectable } from '@nestjs/common';
import { ShortLinkAccessLogRepository } from '../repository/shortlink-access-log.repository';
import { ShortlinkRepository } from '../repository/shortlink.repository';
import { Transaction } from 'sequelize';

export interface AccessLogData {
  shortlinkId: string;
  ipAddress: string;
  userAgent?: string;
  referrer?: string;
  country?: string;
}

export interface ShortlinkAnalytics {
  totalAccess: number;
  uniqueIPs: number;
  topCountries: Array<{ country: string; count: number }>;
  accessByDate: Array<{ date: string; count: number }>;
  deviceStats: {
    mobile: number;
    desktop: number;
    tablet: number;
    other: number;
  };
}

export interface UserAnalytics {
  totalAccess: number;
  uniqueIPs: number;
  topReferrers: Array<{ referrer: string; count: number }>;
  totalShortlinks: number;
}

@Injectable()
export class ShortlinkAnalyticsService {
  constructor(
    private readonly accessLogRepository: ShortLinkAccessLogRepository,
    private readonly shortlinkRepository: ShortlinkRepository,
  ) {}

  async logAccess(
    accessData: AccessLogData,
    transaction?: Transaction,
  ): Promise<void> {
    const logData = {
      shortlink_id: accessData.shortlinkId,
      ip_address: accessData.ipAddress,
      user_agent: accessData.userAgent || '',
      referrer: accessData.referrer || '',
      country:
        accessData.country || this.detectCountryFromIP(accessData.ipAddress),
      accessed_at: new Date(),
    };

    await this.accessLogRepository.createAccessLog(logData, transaction);
  }

  async getShortlinkAnalytics(
    userId: string,
    shortlinkId: string,
  ): Promise<ShortlinkAnalytics> {
    // Verify ownership
    const shortlink =
      await this.shortlinkRepository.getShortlinkById(shortlinkId);
    if (!shortlink || shortlink.user_id !== userId) {
      throw new Error('Shortlink not found or not authorized');
    }

    const stats =
      await this.accessLogRepository.getAccessStatsForShortlink(shortlinkId);

    // Get device stats by analyzing user agents
    const { rows: accessLogs } =
      await this.accessLogRepository.getAccessLogsByShortlinkId(shortlinkId);
    const deviceStats = this.analyzeDeviceStats(
      accessLogs.map((log) => log.user_agent || ''),
    );

    return {
      ...stats,
      deviceStats,
    };
  }

  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    const userStats = await this.accessLogRepository.getUserAccessStats(userId);

    // Count user's shortlinks
    const { count: totalShortlinks } =
      await this.shortlinkRepository.getUserShortlinks(userId, {}, 0, 1);

    return {
      ...userStats,
      totalShortlinks,
    };
  }

  async getAccessLogs(
    userId: string,
    shortlinkId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    // Verify ownership
    const shortlink =
      await this.shortlinkRepository.getShortlinkById(shortlinkId);
    if (!shortlink || shortlink.user_id !== userId) {
      throw new Error('Shortlink not found or not authorized');
    }

    const offset = (page - 1) * limit;
    const { rows, count } =
      await this.accessLogRepository.getAccessLogsByShortlinkId(
        shortlinkId,
        limit,
        offset,
      );

    return {
      data: rows.map((log) => ({
        id: log.id,
        accessed_at: log.accessed_at,
        ip_address: this.maskIP(log.ip_address), // Mask IP for privacy
        user_agent: log.user_agent,
        referrer: log.referrer,
        country: log.country,
        device_type: this.detectDeviceType(log.user_agent || ''),
      })),
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  private analyzeDeviceStats(userAgents: string[]): {
    mobile: number;
    desktop: number;
    tablet: number;
    other: number;
  } {
    const stats = { mobile: 0, desktop: 0, tablet: 0, other: 0 };

    userAgents.forEach((userAgent) => {
      const deviceType = this.detectDeviceType(userAgent);
      stats[deviceType]++;
    });

    return stats;
  }

  private detectDeviceType(
    userAgent: string,
  ): 'mobile' | 'desktop' | 'tablet' | 'other' {
    if (!userAgent) return 'other';

    const ua = userAgent.toLowerCase();

    // Check for tablet first (more specific)
    if (
      ua.includes('ipad') ||
      (ua.includes('android') && !ua.includes('mobile')) ||
      ua.includes('tablet')
    ) {
      return 'tablet';
    }

    // Check for mobile
    if (
      ua.includes('mobile') ||
      ua.includes('iphone') ||
      ua.includes('android') ||
      ua.includes('blackberry') ||
      ua.includes('windows phone')
    ) {
      return 'mobile';
    }

    // Check for desktop browsers
    if (
      ua.includes('windows') ||
      ua.includes('macintosh') ||
      ua.includes('linux') ||
      ua.includes('chrome') ||
      ua.includes('firefox') ||
      ua.includes('safari') ||
      ua.includes('edge')
    ) {
      return 'desktop';
    }

    return 'other';
  }

  private detectCountryFromIP(ipAddress: string): string {
    // Basic IP to country detection
    // In production, you would use a proper GeoIP service like MaxMind
    if (
      ipAddress.startsWith('127.') ||
      ipAddress.startsWith('192.168.') ||
      ipAddress.startsWith('10.')
    ) {
      return 'Local';
    }

    // For now, return unknown - integrate with GeoIP service later
    return 'Unknown';
  }

  private maskIP(ipAddress: string): string {
    // Mask last octet for privacy (e.g., 192.168.1.100 -> 192.168.1.xxx)
    const parts = ipAddress.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }

    // For IPv6, mask last part
    if (ipAddress.includes(':')) {
      const parts = ipAddress.split(':');
      if (parts.length > 1) {
        parts[parts.length - 1] = 'xxxx';
        return parts.join(':');
      }
    }

    return 'xxx.xxx.xxx.xxx';
  }

  private extractClientIP(request: any): string {
    // Extract real client IP from various headers
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    return (
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip ||
      '127.0.0.1'
    );
  }

  async logAccessFromRequest(
    shortlinkId: string,
    request: any,
    transaction?: Transaction,
  ): Promise<void> {
    const accessData: AccessLogData = {
      shortlinkId,
      ipAddress: this.extractClientIP(request),
      userAgent: request.headers['user-agent'] || '',
      referrer: request.headers['referer'] || request.headers['referrer'] || '',
    };

    await this.logAccess(accessData, transaction);
  }
}
