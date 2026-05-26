'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import { getMyMatches, recordIntroViewed } from '@/app/actions/applications';

interface Match {
  id: string;
  matchedUser: {
    id: string;
    name: string;
    email: string;
  };
  kindMyPick: string;
  kindTheirPick: string;
  emailSentAt: string;
  iViewed: string | null;
  theyViewed: string | null;
}

export default function MatchPageContent() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const volumeId = searchParams.get('volume') || '';

  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewedIntroIds, setViewedIntroIds] = useState<Set<string>>(new Set());

  // Load matches on mount
  useEffect(() => {
    async function loadMatches() {
      if (!user?.id || !volumeId) {
        setError('Missing user or event information');
        setLoadingMatches(false);
        return;
      }

      try {
        setLoadingMatches(true);
        setError(null);

        const matchList = await getMyMatches(volumeId);
        setMatches(matchList);
      } catch (err) {
        console.error('Failed to load matches:', err);
        setError(err instanceof Error ? err.message : 'Failed to load matches');
      } finally {
        setLoadingMatches(false);
      }
    }

    loadMatches();
  }, [user?.id, volumeId]);

  // Record view when intro is revealed
  async function markIntroAsViewed(introId: string) {
    if (viewedIntroIds.has(introId)) return; // Already marked

    try {
      await recordIntroViewed(introId);
      setViewedIntroIds(prev => new Set([...prev, introId]));
    } catch (err) {
      console.error('Failed to record view:', err);
    }
  }

  const getMatchTypeLabel = (kind: string) => {
    if (kind === 'both') return 'Both a date & to connect';
    if (kind === 'date') return 'For a date';
    return 'To connect';
  };

  const getMatchTypeBadgeColor = (kind: string) => {
    if (kind === 'both') return '#1B5A6B'; // teal
    if (kind === 'date') return '#FF6B6B'; // coral
    return '#D4F748'; // yellow
  };

  if (loading) {
    return (
      <div className="match-container">
        <div className="loading">Loading your profile...</div>
      </div>
    );
  }

  if (loadingMatches) {
    return (
      <div className="match-container">
        <div className="loading">Loading your matches...</div>
      </div>
    );
  }

  return (
    <div className="match-container">
      <div className="match-header">
        <h1>Your Matches</h1>
        <p className="match-subtitle">
          {matches.length === 0
            ? "You don't have any matches yet. Check back after the event!"
            : `You have ${matches.length} mutual match${matches.length !== 1 ? 'es' : ''}`}
        </p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {matches.length === 0 ? (
        <div className="empty-state">
          <p>No matches at this time. We'll email you as soon as mutual connections are found!</p>
        </div>
      ) : (
        <div className="matches-grid">
          {matches.map(match => {
            const isNewViewed = !viewedIntroIds.has(match.id) && !match.iViewed;

            return (
              <div
                key={match.id}
                className={`match-card ${isNewViewed ? 'is-new' : ''}`}
                onMouseEnter={() => markIntroAsViewed(match.id)}
              >
                <div className="match-card__avatar">
                  {match.matchedUser.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>

                <h3 className="match-card__name">{match.matchedUser.name}</h3>

                <div className="match-card__picks">
                  <div className="pick-badge" style={{ backgroundColor: getMatchTypeBadgeColor(match.kindMyPick) }}>
                    <span className="pick-label">You wanted</span>
                    <span className="pick-type">{getMatchTypeLabel(match.kindMyPick)}</span>
                  </div>

                  <div className="match-icon">💕</div>

                  <div className="pick-badge" style={{ backgroundColor: getMatchTypeBadgeColor(match.kindTheirPick) }}>
                    <span className="pick-label">They wanted</span>
                    <span className="pick-type">{getMatchTypeLabel(match.kindTheirPick)}</span>
                  </div>
                </div>

                <div className="match-card__contact">
                  <a href={`mailto:${match.matchedUser.email}`} className="contact-button">
                    Send Message
                  </a>
                </div>

                {match.theyViewed && (
                  <div className="match-card__status">
                    ✓ They've seen this too
                  </div>
                )}

                {isNewViewed && (
                  <div className="new-badge">New!</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .match-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px clamp(20px, 3vw, 40px);
          min-height: 100vh;
        }

        .match-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .match-header h1 {
          font-family: var(--serif);
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 400;
          color: var(--ink);
          margin-bottom: 12px;
        }

        .match-subtitle {
          font-size: 16px;
          color: var(--ink-soft);
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto;
        }

        .loading {
          text-align: center;
          padding: 40px;
          font-size: 16px;
          color: var(--ink-soft);
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          font-size: 16px;
          color: var(--ink-soft);
        }

        .error-banner {
          background: var(--coral);
          color: white;
          padding: 16px 20px;
          border-radius: var(--r-card);
          margin-bottom: 24px;
          font-size: 14px;
        }

        .matches-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .match-card {
          background: white;
          border: 2px solid var(--line);
          border-radius: var(--r-card);
          padding: 32px 24px;
          text-align: center;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .match-card:hover {
          border-color: var(--teal);
          box-shadow: 0 8px 20px rgba(27, 90, 107, 0.15);
        }

        .match-card.is-new {
          border-color: var(--teal);
          background: linear-gradient(135deg, rgba(27, 90, 107, 0.02) 0%, rgba(212, 247, 72, 0.02) 100%);
        }

        .match-card__avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--cream-warm);
          color: var(--coral);
          font-family: var(--serif);
          font-style: italic;
          font-size: 28px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          flex-shrink: 0;
        }

        .match-card__name {
          font-family: var(--serif);
          font-size: 22px;
          font-weight: 500;
          color: var(--ink);
          margin: 0 0 20px;
          line-height: 1.2;
        }

        .match-card__picks {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .pick-badge {
          padding: 12px;
          border-radius: 8px;
          color: white;
          font-size: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .pick-label {
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          opacity: 0.9;
        }

        .pick-type {
          font-size: 14px;
          font-weight: 500;
        }

        .match-icon {
          font-size: 20px;
          margin: 4px 0;
        }

        .match-card__contact {
          margin-bottom: 16px;
        }

        .contact-button {
          background-color: var(--teal);
          color: white;
          padding: 10px 20px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          display: inline-block;
          transition: background-color 0.2s;
        }

        .contact-button:hover {
          background-color: #154655;
        }

        .match-card__status {
          font-size: 12px;
          color: var(--teal);
          font-weight: 600;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--line);
        }

        .new-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: var(--coral);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        @media (max-width: 768px) {
          .matches-grid {
            grid-template-columns: 1fr;
          }

          .match-card {
            padding: 24px 20px;
          }
        }
      `}</style>
    </div>
  );
}
