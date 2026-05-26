'use server';

import { createClient } from '@supabase/supabase-js';
import { getCurrentUser } from '../lib/auth-utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface VolumeAnalytics {
  volume: {
    id: string;
    name: string;
    status: string;
    doors_date: string;
  };
  applications: {
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    approvalRate: number;
    rejectionReasons: Record<string, number>;
  };
  attendance: {
    confirmed: number;
    checkedIn: number;
    checkInRate: number;
    noShowRate: number;
  };
  sparkPicks: {
    totalPicks: number;
    averagePicksPerAttendee: number;
    byKind: Record<string, number>;
    mostPickedAttendees: Array<{ name: string; count: number }>;
  };
  mutualMatches: {
    total: number;
    matchRate: number;
    byKind: Record<string, number>;
    attendeesWithoutMatches: number;
  };
  engagement: {
    introsViewed: number;
    introViewRate: number;
  };
  financial: {
    totalRevenue: number;
    pendingPayments: number;
    failedPayments: number;
  };
}

/**
 * getVolumeAnalytics: Fetch all metrics for a given volume
 * Requires admin role
 */
export async function getVolumeAnalytics(volumeId: string): Promise<VolumeAnalytics> {
  // Verify admin role
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: adminRole } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!adminRole || adminRole.role !== 'admin') {
    throw new Error('Not authorized: admin role required');
  }

  // Fetch volume info
  const { data: volumeData, error: volumeError } = await supabase
    .from('volumes')
    .select('id, name, status, doors_date')
    .eq('id', volumeId)
    .single();

  if (volumeError || !volumeData) {
    throw new Error('Volume not found');
  }

  // ===== APPLICATIONS =====
  const { data: applicationsRaw } = await supabase
    .from('applications')
    .select('id, admin_decision, rejection_reason')
    .eq('volume_id', volumeId);

  const applications = applicationsRaw || [];
  const total = applications.length;
  const approved = applications.filter(a => a.admin_decision === 'approved').length;
  const rejected = applications.filter(a => a.admin_decision === 'rejected').length;
  const pending = applications.filter(a => a.admin_decision === null).length;
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  // Count rejection reasons
  const rejectionReasons: Record<string, number> = {};
  applications
    .filter(a => a.admin_decision === 'rejected' && a.rejection_reason)
    .forEach(a => {
      const reason = a.rejection_reason || 'unknown';
      rejectionReasons[reason] = (rejectionReasons[reason] || 0) + 1;
    });

  // ===== ATTENDANCE =====
  // Get confirmed attendees: approved applicants with status 'confirmed' or 'checked-in'
  // plus plus-ones with status 'accepted' or 'checked-in'
  const { data: approvedApps } = await supabase
    .from('applications')
    .select('id, applicant_status, plus_one_status')
    .eq('volume_id', volumeId)
    .eq('admin_decision', 'approved');

  let confirmed = 0;
  approvedApps?.forEach(app => {
    if (app.applicant_status === 'confirmed' || app.applicant_status === 'checked-in') {
      confirmed++;
    }
    if (app.plus_one_status === 'accepted' || app.plus_one_status === 'checked-in') {
      confirmed++;
    }
  });

  // Get checked-in count from attendance table
  const { data: attendanceData } = await supabase
    .from('attendance')
    .select('id')
    .in('application_id', approvedApps?.map(a => a.id) || []);

  const checkedIn = attendanceData?.length || 0;
  const checkInRate = confirmed > 0 ? Math.round((checkedIn / confirmed) * 100) : 0;
  const noShowRate = confirmed > 0 ? Math.round(((confirmed - checkedIn) / confirmed) * 100) : 0;

  // ===== SPARK PICKS =====
  const { data: sparkPicksRaw } = await supabase
    .from('sparks_picks')
    .select('id, kind, picker_user_id, picked_user_id')
    .eq('volume_id', volumeId);

  const sparkPicks = sparkPicksRaw || [];
  const totalPicks = sparkPicks.length;
  const uniquePickersSet = new Set(sparkPicks.map(p => p.picker_user_id));
  const uniquePickers = uniquePickersSet.size;
  const averagePicksPerAttendee = uniquePickers > 0 ? Math.round(totalPicks / uniquePickers) : 0;

  const byKind: Record<string, number> = { date: 0, connect: 0, both: 0 };
  sparkPicks.forEach(p => {
    const kind = p.kind || 'both';
    if (kind in byKind) {
      byKind[kind]++;
    }
  });

  // Get most picked attendees
  const pickedCounts: Record<string, number> = {};
  sparkPicks.forEach(p => {
    const pickedId = p.picked_user_id;
    pickedCounts[pickedId] = (pickedCounts[pickedId] || 0) + 1;
  });

  // Fetch names for most picked
  const mostPickedIds = Object.entries(pickedCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  let mostPickedAttendees: Array<{ name: string; count: number }> = [];
  if (mostPickedIds.length > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('id, name')
      .in('id', mostPickedIds);

    mostPickedAttendees = (users || []).map(u => ({
      name: u.name || 'Unknown',
      count: pickedCounts[u.id] || 0,
    }));
  }

  // ===== MUTUAL MATCHES =====
  const { data: introsRaw } = await supabase
    .from('intros')
    .select('id, kind_a, kind_b, email_sent_at, user_a_viewed_at, user_b_viewed_at, user_a_id, user_b_id')
    .eq('volume_id', volumeId);

  const intros = introsRaw || [];
  const totalMutuals = intros.filter(i => i.email_sent_at).length;
  const matchRate = confirmed > 0 ? Math.round((totalMutuals / confirmed) * 100) : 0;

  const introsByKind: Record<string, number> = { date: 0, connect: 0, both: 0 };
  intros.forEach(intro => {
    // Count based on what both parties wanted
    const kindMatch = getIntroKindDisplay(intro.kind_a, intro.kind_b);
    if (kindMatch === 'date') introsByKind.date++;
    else if (kindMatch === 'connect') introsByKind.connect++;
    else if (kindMatch === 'both') introsByKind.both++;
  });

  // Attendees without matches
  const attendeesWithMatches = new Set<string>();
  intros.forEach(intro => {
    if (intro.email_sent_at) {
      attendeesWithMatches.add(intro.user_a_id);
      attendeesWithMatches.add(intro.user_b_id);
    }
  });
  const attendeesWithoutMatches = confirmed - attendeesWithMatches.size;

  // ===== ENGAGEMENT =====
  const introsViewed = intros.filter(i => i.user_a_viewed_at || i.user_b_viewed_at).length;
  const introViewRate = totalMutuals > 0 ? Math.round((introsViewed / totalMutuals) * 100) : 0;

  // ===== FINANCIAL =====
  const { data: paymentsRaw } = await supabase
    .from('payments')
    .select('id, amount_cents, status')
    .in('application_id', approvedApps?.map(a => a.id) || []);

  const payments = paymentsRaw || [];
  const totalRevenue = payments
    .filter(p => p.status === 'succeeded')
    .reduce((sum, p) => sum + (p.amount_cents || 0), 0) / 100;
  const pendingPayments = payments.filter(p => p.status === 'processing').length;
  const failedPayments = payments.filter(p => p.status === 'failed').length;

  return {
    volume: {
      id: volumeData.id,
      name: volumeData.name,
      status: volumeData.status,
      doors_date: volumeData.doors_date,
    },
    applications: {
      total,
      approved,
      rejected,
      pending,
      approvalRate,
      rejectionReasons,
    },
    attendance: {
      confirmed,
      checkedIn,
      checkInRate,
      noShowRate,
    },
    sparkPicks: {
      totalPicks,
      averagePicksPerAttendee,
      byKind,
      mostPickedAttendees,
    },
    mutualMatches: {
      total: totalMutuals,
      matchRate,
      byKind: introsByKind,
      attendeesWithoutMatches,
    },
    engagement: {
      introsViewed,
      introViewRate,
    },
    financial: {
      totalRevenue,
      pendingPayments,
      failedPayments,
    },
  };
}

/**
 * Helper: Determine display kind for an intro based on both parties' preferences
 */
function getIntroKindDisplay(kindA: string, kindB: string): string {
  if (kindA === 'both' && kindB === 'both') return 'both';
  if (kindA === 'date' && kindB === 'date') return 'date';
  if (kindA === 'connect' && kindB === 'connect') return 'connect';
  // Mixed: default to 'both'
  return 'both';
}

export interface VolumeListItem {
  id: string;
  number: number;
  name: string;
  status: string;
  doors_date: string;
}

/**
 * listAllVolumes: Get all volumes (for admin volumes list page)
 * Requires admin role
 */
export async function listAllVolumes(): Promise<VolumeListItem[]> {
  // Verify admin role
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: adminRole } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!adminRole || adminRole.role !== 'admin') {
    throw new Error('Not authorized: admin role required');
  }

  const { data: volumes, error } = await supabase
    .from('volumes')
    .select('id, number, name, status, doors_date')
    .order('doors_date', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch volumes: ${error.message}`);
  }

  return volumes || [];
}
