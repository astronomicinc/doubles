'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import { getEventAttendees, getMyPicks } from '@/app/actions/applications';

interface Attendee {
  id: string;
  name: string;
  email: string;
  role: 'Applicant' | 'Plus-One' | 'Attendee';
}

export default function SparksPageContent() {
  const { user, session } = useAuth();
  const searchParams = useSearchParams();
  const volumeId = searchParams.get('volume') || '';

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [myPicks, setMyPicks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingPick, setSavingPick] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load attendee list and user's picks on mount
  useEffect(() => {
    async function loadData() {
      if (!user?.id || !volumeId) {
        setError('Missing user or event information');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch attendees and picks
        const [attendeeList, picks] = await Promise.all([
          getEventAttendees(volumeId, user.id),
          getMyPicks(volumeId),
        ]);

        setAttendees(attendeeList);
        setMyPicks(picks);
      } catch (err) {
        console.error('Failed to load sparks data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load attendees');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.id, volumeId]);

  // Handle spark pick change (auto-save)
  async function handlePick(pickedUserId: string, kind: string | null) {
    if (!session?.access_token) {
      setError('Not authenticated');
      return;
    }

    try {
      setSavingPick(pickedUserId);
      setError(null);

      // If kind is null, they're clearing the pick (shouldn't happen with radio, but handle it)
      if (!kind) {
        kind = 'both'; // Default to both
      }

      const response = await fetch('/api/sparks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          pickedUserId,
          volumeId,
          kind,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save pick');
      }

      // Update local state
      setMyPicks(prev => ({
        ...prev,
        [pickedUserId]: kind!,
      }));
    } catch (err) {
      console.error('Pick save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save pick');
    } finally {
      setSavingPick(null);
    }
  }

  if (loading) {
    return (
      <div className="sparks-container">
        <div className="loading">Loading attendees...</div>
      </div>
    );
  }

  return (
    <div className="sparks-container">
      <div className="sparks-header">
        <h1>Who sparked with you?</h1>
        <p className="sparks-subtitle">
          Select up to 5 people you'd like to meet or just connect with.
          Your picks are private — no one sees who you picked.
        </p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {attendees.length === 0 ? (
        <div className="empty-state">
          <p>No attendees found for this event.</p>
        </div>
      ) : (
        <div className="attendees-grid">
          {attendees.map(person => (
            <div
              key={person.id}
              className={`attendee-card ${myPicks[person.id] ? 'is-picked' : ''}`}
              data-picked={myPicks[person.id] || ''}
            >
              <div className="attendee-card__avatar">
                {person.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>

              <h3 className="attendee-card__name">{person.name}</h3>
              <span className="attendee-card__role">{person.role}</span>

              <fieldset className="pick-options">
                <label className="pick-option">
                  <input
                    type="radio"
                    name={`pick-${person.id}`}
                    value="date"
                    checked={myPicks[person.id] === 'date'}
                    onChange={() => handlePick(person.id, 'date')}
                    disabled={savingPick === person.id}
                  />
                  <span>Date</span>
                </label>

                <label className="pick-option">
                  <input
                    type="radio"
                    name={`pick-${person.id}`}
                    value="connect"
                    checked={myPicks[person.id] === 'connect'}
                    onChange={() => handlePick(person.id, 'connect')}
                    disabled={savingPick === person.id}
                  />
                  <span>Connect</span>
                </label>

                <label className="pick-option">
                  <input
                    type="radio"
                    name={`pick-${person.id}`}
                    value="both"
                    checked={myPicks[person.id] === 'both'}
                    onChange={() => handlePick(person.id, 'both')}
                    disabled={savingPick === person.id}
                  />
                  <span>Both</span>
                </label>

                <label className="pick-option">
                  <input
                    type="radio"
                    name={`pick-${person.id}`}
                    value=""
                    checked={!myPicks[person.id]}
                    onChange={() => handlePick(person.id, '')}
                    disabled={savingPick === person.id}
                  />
                  <span>Pass</span>
                </label>
              </fieldset>

              {savingPick === person.id && (
                <div className="saving-indicator">Saving...</div>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .sparks-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px clamp(20px, 3vw, 40px);
          min-height: 100vh;
        }

        .sparks-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .sparks-header h1 {
          font-family: var(--serif);
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 400;
          color: var(--ink);
          margin-bottom: 12px;
        }

        .sparks-subtitle {
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

        .attendees-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .attendee-card {
          background: white;
          border: 1px solid var(--line);
          border-radius: var(--r-card);
          padding: 24px;
          text-align: center;
          transition: all 0.2s;
          position: relative;
        }

        .attendee-card:hover {
          border-color: var(--teal);
          box-shadow: 0 4px 12px rgba(27, 90, 107, 0.1);
        }

        .attendee-card.is-picked {
          background: var(--cream);
          border-color: var(--teal);
        }

        .attendee-card__avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--cream-warm);
          color: var(--coral);
          font-family: var(--serif);
          font-style: italic;
          font-size: 20px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          flex-shrink: 0;
        }

        .attendee-card__name {
          font-family: var(--serif);
          font-size: 20px;
          font-weight: 500;
          color: var(--ink);
          margin: 0 0 6px;
          line-height: 1.2;
        }

        .attendee-card__role {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink-soft);
          margin-bottom: 16px;
        }

        .pick-options {
          border: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .pick-option {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 6px;
          transition: background 0.15s;
          font-size: 13px;
          color: var(--ink);
        }

        .pick-option:hover {
          background: var(--cream-warm);
        }

        .pick-option input[type='radio'] {
          cursor: pointer;
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        .pick-option span {
          font-weight: 500;
        }

        .saving-indicator {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 11px;
          color: var(--teal);
          font-weight: 600;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .attendees-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          }

          .attendee-card {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}
