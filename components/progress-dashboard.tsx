"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { appCatalog } from "../lib/data";
import { answersMatch } from "../lib/canonical-engine";
import { questionsForEngine } from "../lib/question-source";
import {
  getAttempts,
  getBookmarks,
  getPracticeDays,
  getWrongQuestions,
} from "../lib/progress";
import { supabase } from "../lib/supabase";

const norm = (v: unknown) => String(v ?? "").trim().toLowerCase();
const answeredValue = (v: unknown) => v !== undefined && v !== null && v !== "";
const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);
const pad = (n: number) => String(n).padStart(2, "0");
const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function currentStreak(days: string[]) {
  const set = new Set(days);
  const today = new Date();
  let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!set.has(toDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (set.has(toDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function shortDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

function activityDays(attempts: any[]) {
  const now = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - index));
    const key = toDateKey(date);
    const completed = attempts.filter(
      (a) => a.completedAt && toDateKey(new Date(a.completedAt)) === key
    ).length;
    return {
      key,
      label: date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2),
      date: date.getDate(),
      completed,
    };
  });
}

export default function ProgressDashboard({ compact = false }: { compact?: boolean }) {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [userId, setUserId] = useState("");
  const [refresh, setRefresh] = useState(0);

  const loadProgress = () => {
    setAttempts(getAttempts());
    setBookmarks(getBookmarks().length);
    setWrong(getWrongQuestions().length);
  };

  useEffect(() => {
    loadProgress();
    const onUpdate = () => {
      loadProgress();
      setRefresh((v) => v + 1);
    };
    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key.startsWith("aptitude:")) onUpdate();
    };
    window.addEventListener("aptitude:progress-updated", onUpdate);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onUpdate);

    supabase?.auth.getSession().then(({ data }) =>
      setUserId(data.session?.user?.id || "")
    );
    const sub = supabase?.auth.onAuthStateChange((_event, session) =>
      setUserId(session?.user?.id || "")
    ).data.subscription;

    return () => {
      window.removeEventListener("aptitude:progress-updated", onUpdate);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onUpdate);
      sub?.unsubscribe();
    };
  }, []);

  const latest = useMemo(() => {
    const map = new Map<string, any>();
    [...attempts]
      .filter((a) => a.completedAt)
      .sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      )
      .forEach((a) => {
        if (!map.has(a.testId)) map.set(a.testId, a);
      });
    return map;
  }, [attempts, refresh]);

  const completed = [...latest.values()];

  const stats = useMemo(() => {
    let answered = 0;
    let correct = 0;
    latest.forEach((a) =>
      questionsForEngine(a.testId).forEach((q: any) => {
        const value = a.answers?.[q.id];
        if (answeredValue(value)) {
          answered++;
          if (answersMatch(q, value)) correct++;
        }
      })
    );
    const total = appCatalog.stats.question_count;
    return {
      answered,
      correct,
      accuracy: pct(correct, answered),
      coverage: pct(answered, total),
    };
  }, [latest]);

  const pillars = useMemo(
    () =>
      appCatalog.pillars.map((p: any) => {
        let answered = 0;
        let correct = 0;
        latest.forEach((a: any) => {
          const test = appCatalog.tests.find((t: any) => t.test_id === a.testId);
          if (test?.pillar !== p.id) return;
          questionsForTest(a.testId).forEach((q: any) => {
            const value = a.answers?.[q.id];
            if (answeredValue(value)) {
              answered++;
              if (norm(value) === norm(q.a)) correct++;
            }
          });
        });
        return {
          ...p,
          answered,
          correct,
          accuracy: pct(correct, answered),
        };
      }),
    [latest]
  );

  const activity = useMemo(() => activityDays(attempts), [attempts]);
  const maxActivity = Math.max(1, ...activity.map((d) => d.completed));
  const practiceDays = userId ? getPracticeDays(userId) : [];
  const streak = currentStreak(practiceDays);

  const recentTests = useMemo(
    () =>
      completed
        .slice()
        .sort(
          (a, b) =>
            new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        )
        .slice(0, 5)
        .map((a) => {
          const qs = questionsForEngine(a.testId);
          let answered = 0;
          let correct = 0;
          qs.forEach((q: any) => {
            const value = a.answers?.[q.id];
            if (answeredValue(value)) {
              answered++;
              if (norm(value) === norm(q.a)) correct++;
            }
          });
          const test = appCatalog.tests.find((t: any) => t.test_id === a.testId);
          return {
            ...a,
            title: test?.title?.replaceAll("_", " ") || a.testId,
            pillar: test?.pillar || "",
            answered,
            accuracy: pct(correct, answered),
            total: qs.length,
          };
        }),
    [completed]
  );

  if (compact) {
    return (
      <section className="progress-compact">
        <div className="progress-compact-head">
          <div>
            <p className="eyebrow">Your progress</p>
            <h2 className="progress-compact-title">Keep your momentum</h2>
            <p className="progress-compact-copy">
              A little practice adds up. Keep going and watch your progress build.
            </p>
          </div>
          <Link href="/dashboard" className="progress-compact-link">
            Full dashboard <span>↗</span>
          </Link>
        </div>
        <div className="progress-compact-stats">
          <div className="progress-compact-stat progress-stat-rose">
            <span className="progress-stat-label">Tests completed</span>
            <strong>{completed.length}<small>/{appCatalog.tests.length}</small></strong>
            <span className="progress-stat-note">tests finished</span>
          </div>
          <div className="progress-compact-stat progress-stat-blue">
            <span className="progress-stat-label">Accuracy</span>
            <strong>{stats.accuracy}<small>%</small></strong>
            <span className="progress-stat-note">across answered questions</span>
          </div>
          <div className="progress-compact-stat progress-stat-mint">
            <span className="progress-stat-label">Questions answered</span>
            <strong>{stats.answered}<small>/{appCatalog.stats.question_count}</small></strong>
            <span className="progress-stat-note">of the question bank</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="editorial-dashboard">
      <section className="dash-hero-grid">
        <div className="dash-panel dash-panel--welcome">
          <div className="dash-panel-inner">
            <p className="dash-kicker">01 · Overview</p>
            <h2 className="dash-title">Your practice at a glance.</h2>
            <p className="dash-copy">
              A live view of what you have completed, answered and where your accuracy is landing.
            </p>
            <div className="dash-hero-metric">
              <div>
                <span>Question bank coverage</span>
                <strong>{stats.coverage}<small>%</small></strong>
              </div>
              <div className="dash-hero-track">
                <span style={{ width: `${stats.coverage}%` }} />
              </div>
            </div>
            <div className="dash-kpi-grid">
              <div className="dash-kpi dash-kpi-rose">
                <span>Tests</span>
                <strong>{completed.length}<small>/{appCatalog.tests.length}</small></strong>
                <em>completed</em>
              </div>
              <div className="dash-kpi dash-kpi-blue">
                <span>Questions</span>
                <strong>{stats.answered}<small>/{appCatalog.stats.question_count}</small></strong>
                <em>answered</em>
              </div>
              <div className="dash-kpi dash-kpi-mint">
                <span>Accuracy</span>
                <strong>{stats.accuracy}<small>%</small></strong>
                <em>overall</em>
              </div>
              <div className="dash-kpi dash-kpi-peach">
                <span>Review</span>
                <strong>{wrong}</strong>
                <em>wrong to revisit</em>
              </div>
            </div>
          </div>
        </div>

        <section className="dash-panel dash-panel--activity">
          <div className="dash-panel-inner">
            <div className="dash-head">
              <div>
                <p className="dash-kicker">02 · Activity</p>
                <h2 className="dash-title">Keep the rhythm.</h2>
              </div>
              <div className="dash-streak-pill">
                <strong>{streak}</strong>
                <span>day streak</span>
              </div>
            </div>
            <div className="dash-activity-chart">
              {activity.map((day) => (
                <div className="dash-activity-day" key={day.key}>
                  <div className="dash-activity-bar">
                    <span
                      style={{
                        height: day.completed
                          ? `${Math.max(18, (day.completed / maxActivity) * 100)}%`
                          : "5%",
                      }}
                      className={day.completed ? "active" : ""}
                    />
                  </div>
                  <b>{day.label}</b>
                  <small>{day.date}</small>
                </div>
              ))}
            </div>
            <div className="dash-activity-footer">
              <span><b>{activity.reduce((sum, d) => sum + d.completed, 0)}</b> tests this week</span>
              <span>{userId ? "Streak syncs with your account" : "Sign in to track your streak"}</span>
            </div>
          </div>
        </section>
      </section>

      <section className="dash-panel dash-panel--pillars">
        <div className="dash-panel-inner">
          <div className="dash-head">
            <div>
              <p className="dash-kicker">03 · Reasoning profile</p>
              <h2 className="dash-title">Strengths & gaps.</h2>
              <p className="dash-copy">Accuracy is calculated from your latest completed attempt for each test.</p>
            </div>
            <span className="dash-calendar-meta">Answered · accuracy</span>
          </div>
          <div className="dash-profile-grid">
            {pillars.map((p: any, index: number) => (
              <div key={p.id} className={`dash-profile-card profile-tone-${index % 6}`}>
                <div className="dash-profile-top">
                  <div className="dash-profile-index">0{index + 1}</div>
                  <span>{p.answered} answered</span>
                </div>
                <div className="dash-profile-name">{p.name}</div>
                <div className="dash-profile-bottom">
                  <div className="dash-profile-track">
                    <span style={{ width: `${p.accuracy}%` }} />
                  </div>
                  <strong>{p.accuracy}%</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dash-panel dash-panel--recent">
        <div className="dash-panel-inner">
          <div className="dash-head">
            <div>
              <p className="dash-kicker">04 · Recent practice</p>
              <h2 className="dash-title">What you have completed.</h2>
            </div>
            <Link href="/practice" className="dash-link">Browse all tests →</Link>
          </div>

          {recentTests.length ? (
            <div className="dash-recent-list">
              {recentTests.map((item, index) => (
                <Link href={`/tests/${item.testId}/result`} className="dash-recent-row" key={item.id}>
                  <span className="dash-recent-number">0{index + 1}</span>
                  <div className="dash-recent-copy">
                    <strong>{item.title}</strong>
                    <span>{item.pillar ? item.pillar.replaceAll("_", " ") : "Practice"} · {shortDate(item.completedAt)}</span>
                  </div>
                  <div className="dash-recent-meter">
                    <span style={{ width: `${item.accuracy}%` }} />
                  </div>
                  <strong className="dash-recent-score">{item.accuracy}%</strong>
                </Link>
              ))}
            </div>
          ) : (
            <div className="dash-recent-empty">
              <span>01</span>
              <div>
                <strong>No completed tests yet.</strong>
                <p>Finish your first practice set and your performance will appear here automatically.</p>
              </div>
              <Link href="/practice" className="yellow-button">Start practicing →</Link>
            </div>
          )}
        </div>
      </section>

      <div className="dash-bottom-grid">
        <Link href="/bookmarks" className="dash-action">
          <div className="dash-action-kicker">05 · Saved</div>
          <div className="dash-action-title">{bookmarks} bookmarks.</div>
          <p className="dash-action-copy">Questions you chose to revisit.</p>
        </Link>
        <Link href="/practice" className="dash-action">
          <div className="dash-action-kicker">06 · Next</div>
          <div className="dash-action-title">Continue practicing.</div>
          <p className="dash-action-copy">Pick an unfinished test and keep going.</p>
        </Link>
      </div>
    </div>
  );
}
