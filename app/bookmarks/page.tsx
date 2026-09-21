"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { appCatalog, pillarMap } from "../../lib/data";
import { getAttempts, getStarredTests, toggleStarredTest } from "../../lib/progress";

const STARRED_PER_PAGE = 4;
const TONES = ["pink", "lavender", "lime", "mint", "sky", "peach"];

export default function Bookmarks() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [stars, setStars] = useState<string[]>([]);
  const [unfinishedPage, setUnfinishedPage] = useState(0);
  const [starredPage, setStarredPage] = useState(0);

  useEffect(() => {
    const sync = () => {
      setAttempts(getAttempts());
      setStars(getStarredTests());
    };
    sync();
    window.addEventListener("aptitude:progress-updated", sync as EventListener);
    return () => window.removeEventListener("aptitude:progress-updated", sync as EventListener);
  }, []);

  const unfinished = attempts
    .filter((a) => !a.completedAt)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const starred = appCatalog.tests.filter((t: any) => stars.includes(t.test_id));
  const currentAttempt = unfinished[unfinishedPage];
  const starredPageCount = Math.max(1, Math.ceil(starred.length / STARRED_PER_PAGE));
  const visibleStarred = starred.slice(
    starredPage * STARRED_PER_PAGE,
    starredPage * STARRED_PER_PAGE + STARRED_PER_PAGE
  );

  const testFor = (id: string) => appCatalog.tests.find((t: any) => t.test_id === id);

  const toggleStar = (id: string) => {
    toggleStarredTest(id);
    setStars(getStarredTests());
    setStarredPage((p) => Math.min(p, Math.max(0, Math.ceil((starred.length - 1) / STARRED_PER_PAGE) - 1)));
  };

  const answeredCount = currentAttempt ? Object.keys(currentAttempt.answers || {}).length : 0;
  const currentTest: any = currentAttempt ? testFor(currentAttempt.testId) : null;
  const totalQuestions = Number(currentTest?.question_count || 0);
  const progress = totalQuestions ? Math.min(100, Math.round((answeredCount / totalQuestions) * 100)) : 0;

  return (
    <div className="app-page bookmarks-page">
      <header className="bookmarks-hero">
        <div className="bookmarks-hero-copy">
          <p className="eyebrow">Your library</p>
          <h1>Things worth coming back to.</h1>
          <p className="bookmarks-lede">Unfinished sessions and favourite tests, kept together.</p>
        </div>

        <div className="bookmarks-summary">
          <div className="summary-stat">
            <div className="summary-icon summary-clock">◷</div>
            <div>
              <strong>{unfinished.length}</strong>
              <span>in progress</span>
            </div>
          </div>
          <div className="summary-divider" />
          <div className="summary-stat">
            <div className="summary-icon summary-star">★</div>
            <div>
              <strong>{starred.length}</strong>
              <span>starred</span>
            </div>
          </div>
        </div>
      </header>

      <section className="bookmark-section bookmark-section-progress">
        <div className="bookmark-section-head">
          <div>
            <p className="eyebrow">01 · Continue</p>
            <h2>In progress</h2>
            <p>Pick up where you left off. Your unfinished tests are saved here.</p>
          </div>
          <Link href="/practice" className="bookmarks-browse">Browse practice <span>→</span></Link>
        </div>

        {currentAttempt && currentTest ? (
          <div className="progress-carousel">
            <div className="progress-card">
              <div className="progress-card-icon">◷</div>
              <div className="progress-card-main">
                <strong>{currentTest.title.replaceAll("_", " ")}</strong>
                <span>{pillarMap[currentTest.pillar] || currentTest.pillar} · {answeredCount} / {totalQuestions} questions</span>
                <div className="progress-line">
                  <i style={{ width: `${progress}%` }} />
                </div>
              </div>
              <b className="progress-percent">{progress}%</b>
              <Link href={`/tests/${currentAttempt.testId}`} className="progress-open" aria-label="Continue test">→</Link>
            </div>

            <div className="carousel-controls">
              <button
                type="button"
                aria-label="Previous unfinished test"
                disabled={unfinishedPage === 0}
                onClick={() => setUnfinishedPage((p) => Math.max(0, p - 1))}
              >←</button>
              <span>{unfinishedPage + 1} / {unfinished.length}</span>
              <button
                type="button"
                aria-label="Next unfinished test"
                disabled={unfinishedPage >= unfinished.length - 1}
                onClick={() => setUnfinishedPage((p) => Math.min(unfinished.length - 1, p + 1))}
              >→</button>
            </div>
          </div>
        ) : (
          <div className="bookmark-empty">
            <div className="bookmark-icon">◷</div>
            <div className="bookmark-empty-copy">
              <strong>No unfinished tests.</strong>
              <p>Start one from the practice library and it will appear here so you can continue later.</p>
              <Link href="/practice" className="yellow-button">Browse tests</Link>
            </div>
          </div>
        )}
      </section>

      <section className="bookmark-section bookmark-section-starred">
        <div className="bookmark-section-head">
          <div>
            <p className="eyebrow">02 · Favourites</p>
            <h2>Starred tests</h2>
            <p>Quick access to the tests you’ve starred.</p>
          </div>
          <div className="bookmark-count">
            <strong>{starred.length}</strong>
            <span>starred</span>
          </div>
        </div>

        {starred.length ? (
          <div className="starred-carousel">
            <div className="starred-grid">
              {visibleStarred.map((t: any, i: number) => (
                <article key={t.test_id} className={`starred-card tone-${TONES[((starredPage * STARRED_PER_PAGE) + i) % TONES.length]}`}>
                  <button type="button" className="starred-card-star" aria-label="Remove bookmark" onClick={() => toggleStar(t.test_id)}>★</button>
                  <Link href={`/tests/${t.test_id}`}>
                    <span className="practice-index">{t.test_id.replace("TEST_", "")}</span>
                    <h3>{t.title.replaceAll("_", " ")}</h3>
                    <p>{t.question_count} questions</p>
                    <span className="starred-card-arrow">→</span>
                  </Link>
                </article>
              ))}
            </div>
            <div className="carousel-controls starred-controls">
              <button
                type="button"
                aria-label="Previous starred tests"
                disabled={starredPage === 0}
                onClick={() => setStarredPage((p) => Math.max(0, p - 1))}
              >←</button>
              <span>{starredPage + 1} / {starredPageCount}</span>
              <button
                type="button"
                aria-label="Next starred tests"
                disabled={starredPage >= starredPageCount - 1}
                onClick={() => setStarredPage((p) => Math.min(starredPageCount - 1, p + 1))}
              >→</button>
            </div>
          </div>
        ) : (
          <div className="bookmark-empty">
            <div className="bookmark-icon bookmark-icon-star">☆</div>
            <div className="bookmark-empty-copy">
              <strong>Nothing starred yet.</strong>
              <p>Tap ☆ on any test in the practice library to keep it here.</p>
              <Link href="/practice" className="yellow-button">Browse tests</Link>
            </div>
          </div>
        )}
      </section>

      <aside className="bookmark-tip">
        <div className="bookmark-icon bookmark-icon-tip">♧</div>
        <div>
          <span>TIP</span>
          <p>Star tests you want to revisit later — they’ll appear here for quick access.</p>
        </div>
      </aside>

      <style jsx>{`
        .bookmarks-page {
          width: 100%;
          max-width: 1320px;
          margin: 0 auto;
          padding-top: 38px;
          padding-bottom: 42px;
        }

        .bookmarks-hero {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 402px;
          align-items: center;
          gap: 50px;
          padding: 8px 0 30px;
        }

        .bookmarks-hero-copy h1 {
          margin-top: 7px;
          font-size: clamp(44px, 4.25vw, 58px);
          line-height: .98;
          letter-spacing: -.055em;
          font-weight: 500;
        }

        .bookmarks-lede {
          margin-top: 12px;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.5;
        }

        .bookmarks-summary {
          display: flex;
          align-items: center;
          min-height: 104px;
          padding: 16px 20px;
          border: 1px solid var(--line);
          border-radius: 16px;
          background: rgba(255,255,255,.52);
        }

        .summary-stat {
          display: flex;
          align-items: center;
          gap: 15px;
          flex: 1;
        }

        .summary-icon {
          width: 56px;
          height: 56px;
          flex: 0 0 56px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          font-size: 27px;
          border: 1px solid rgba(0,0,0,.035);
        }

        .summary-clock { background: #f7f2c8; }
        .summary-star { background: #eee4f8; font-size: 24px; }

        .summary-stat strong {
          display: block;
          font-size: 24px;
          line-height: 1;
          font-weight: 500;
          letter-spacing: -.04em;
        }

        .summary-stat span {
          display: block;
          margin-top: 6px;
          color: var(--muted);
          font-size: 11px;
        }

        .summary-divider {
          width: 1px;
          height: 56px;
          background: var(--line);
          margin: 0 19px;
        }

        .bookmark-section {
          padding: 24px 0 26px;
          border-bottom: 1px solid var(--line);
        }

        /* The starred carousel is intentionally full-bleed: the card track should use the
           whole viewport rather than the narrower reading column used by the hero. */
        .bookmark-section-starred {
          width: 100vw;
          margin-left: calc(50% - 50vw);
          padding-left: 0;
          padding-right: 0;
        }

        .bookmark-section-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 28px;
        }

        .bookmark-section-head h2 {
          margin-top: 7px;
          font-size: 30px;
          line-height: 1;
          letter-spacing: -.045em;
          font-weight: 500;
        }

        .bookmark-section-head > div:first-child > p:last-child {
          margin-top: 9px;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.5;
        }

        .bookmarks-browse {
          margin-bottom: 2px;
          padding-bottom: 4px;
          border-bottom: 1px solid #cfcac0;
          color: #34332f;
          font-size: 12px;
          white-space: nowrap;
        }

        .bookmarks-browse span { margin-left: 7px; font-size: 16px; }

        .bookmark-count {
          min-width: 48px;
          text-align: right;
          padding-bottom: 2px;
        }

        .bookmark-count strong {
          display: block;
          font-size: 20px;
          line-height: 1;
          font-weight: 500;
          letter-spacing: -.04em;
        }

        .bookmark-count span {
          display: block;
          margin-top: 6px;
          color: var(--muted);
          font-size: 9px;
        }

        .progress-carousel {
          position: relative;
          display: block;
          width: 100%;
          box-sizing: border-box;
          margin-top: 20px;
          padding: 17px 18px 70px;
          border: 1px solid var(--line);
          border-radius: 16px;
          background: rgba(255,255,255,.45);
          overflow: hidden;
        }

        .progress-card {
          min-width: 0;
          min-height: 96px;
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 10px;
          border: 1px solid var(--line);
          border-radius: 14px;
          background: #fff;
        }

        .progress-card-icon {
          width: 74px;
          height: 74px;
          flex: 0 0 74px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #fde8ef;
          font-size: 31px;
          border: 1px solid #f5d6df;
        }

        .progress-card-main {
          min-width: 0;
          flex: 1;
        }

        .progress-card-main strong {
          display: block;
          font-size: 15px;
          line-height: 1.2;
          font-weight: 500;
        }

        .progress-card-main > span {
          display: block;
          margin-top: 7px;
          color: var(--muted);
          font-size: 11px;
        }

        .progress-line {
          width: min(275px, 100%);
          height: 8px;
          margin-top: 12px;
          overflow: hidden;
          border-radius: 999px;
          background: #ece9e2;
        }

        .progress-line i {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: #282925;
        }

        .progress-percent {
          flex: 0 0 auto;
          align-self: flex-end;
          margin-bottom: 11px;
          font-size: 12px;
          font-weight: 500;
        }

        .progress-open,
        .starred-card-arrow {
          display: grid;
          place-items: center;
          border: 1px solid #ddd9d1;
          border-radius: 50%;
          background: #fff;
        }

        .progress-open {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          font-size: 20px;
        }

        .carousel-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 11px;
        }

        .progress-carousel > .carousel-controls {
          position: absolute;
          right: 18px;
          bottom: 12px;
          z-index: 2;
        }

        .carousel-controls button {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border: 1px solid #dedbd4;
          border-radius: 50%;
          background: #fff;
          color: #4b4944;
          font-size: 18px;
          line-height: 1;
        }

        .carousel-controls button:disabled {
          opacity: .32;
          cursor: default;
        }

        .carousel-controls span {
          min-width: 40px;
          text-align: center;
          font-size: 11px;
          font-weight: 600;
          color: #4d4b46;
        }

        .bookmark-empty {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-top: 20px;
          min-height: 116px;
          padding: 20px 22px;
          border: 1px dashed #d8d4cb;
          border-radius: 15px;
          background: rgba(255,255,255,.38);
        }

        .bookmark-icon {
          width: 56px;
          height: 56px;
          flex: 0 0 56px;
          display: grid;
          place-items: center;
          border: 1px solid #e4e0d8;
          border-radius: 50%;
          background: #f7f5ef;
          color: #30312e;
          font-size: 28px;
        }

        .bookmark-icon-star { font-size: 32px; }
        .bookmark-empty-copy strong { font-size: 14px; font-weight: 500; }
        .bookmark-empty-copy p {
          margin-top: 5px;
          color: var(--muted);
          font-size: 11px;
          line-height: 1.5;
        }
        .bookmark-empty-copy .yellow-button {
          display: inline-flex;
          margin-top: 11px;
          text-decoration: none;
        }

        .starred-carousel {
          position: relative;
          display: block;
          width: 100%;
          box-sizing: border-box;
          margin-top: 20px;
          padding-bottom: 58px;
        }

        .starred-grid {
          width: 100%;
          min-width: 0;
          display: flex;
          flex-wrap: nowrap;
          gap: 14px;
          overflow: hidden;
        }

        .starred-card {
          position: relative;
          flex: 0 0 calc((100% - 42px) / 4);
          width: calc((100% - 42px) / 4);
          min-width: 0;
          min-height: 134px;
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 14px;
          background: #fff;
        }

        .starred-card::after {
          content: "";
          position: absolute;
          right: -16px;
          top: 16px;
          width: 72px;
          height: 58px;
          border-radius: 50%;
          opacity: .78;
          pointer-events: none;
        }

        .tone-pink::after { background: var(--pink); }
        .tone-lavender::after { background: var(--lav); }
        .tone-lime::after { background: #e4ef9a; }
        .tone-mint::after { background: var(--mint); }
        .tone-sky::after { background: var(--sky); }
        .tone-peach::after { background: var(--peach); }

        .starred-card > a {
          display: block;
          height: 100%;
          padding: 16px;
          color: inherit;
          text-decoration: none;
        }

        .starred-card h3 {
          max-width: 205px;
          margin-top: 15px;
          font-size: 16px;
          line-height: 1.1;
          letter-spacing: -.035em;
          font-weight: 500;
        }

        .starred-card p {
          margin-top: 7px;
          color: var(--muted);
          font-size: 10px;
        }

        .starred-card-star {
          position: absolute;
          z-index: 2;
          top: 14px;
          right: 16px;
          border: 0;
          padding: 0;
          background: transparent;
          color: #44433e;
          font-size: 17px;
          cursor: pointer;
        }

        .starred-card-arrow {
          position: absolute;
          right: 14px;
          bottom: 12px;
          width: 32px;
          height: 32px;
          font-size: 15px;
        }

        .starred-controls {
          position: absolute;
          right: 0;
          bottom: 0;
          justify-content: flex-end;
        }

        .bookmark-tip {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-top: 20px;
          padding: 12px 18px;
          border: 1px solid var(--line);
          border-radius: 15px;
          background: rgba(255,255,255,.46);
        }

        .bookmark-tip .bookmark-icon {
          width: 46px;
          height: 46px;
          flex-basis: 46px;
          font-size: 24px;
        }

        .bookmark-tip span {
          display: block;
          color: #77736b;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .12em;
        }

        .bookmark-tip p {
          margin-top: 4px;
          color: #66635d;
          font-size: 10px;
          line-height: 1.45;
        }

        @media (min-width: 901px) {
          .bookmarks-page {
            padding-top: 28px;
            padding-bottom: 28px;
          }
          .bookmarks-hero {
            padding-top: 10px;
            padding-bottom: 27px;
          }
          .bookmarks-hero-copy h1 {
            font-size: clamp(46px, 4vw, 56px);
          }
          .bookmark-section {
            padding-top: 22px;
            padding-bottom: 24px;
          }
        }

        @media (max-width: 1100px) {
          .bookmarks-page { max-width: 100%; }
          .bookmarks-hero { grid-template-columns: minmax(0,1fr) 350px; gap: 30px; }
          .starred-card h3 { font-size: 14px; }
        }

        @media (max-width: 820px) {
          .bookmarks-page { padding-top: 20px; padding-bottom: 45px; }
          .bookmarks-hero { grid-template-columns: 1fr; gap: 20px; }
          .bookmarks-summary { max-width: 430px; }
          .bookmark-section-head { align-items: flex-start; }
          .carousel-controls { justify-content: flex-end; }
          .starred-grid { gap: 12px; }
          .starred-card {
            flex-basis: calc((100% - 12px) / 2);
            width: calc((100% - 12px) / 2);
          }
        }

        @media (max-width: 560px) {
          .bookmarks-page { padding-left: 16px; padding-right: 16px; }
          .bookmarks-hero-copy h1 { font-size: 34px; }
          .bookmarks-lede { font-size: 12px; }
          .bookmarks-summary { min-height: 90px; padding: 12px; }
          .summary-icon { width: 46px; height: 46px; flex-basis: 46px; font-size: 22px; }
          .summary-stat strong { font-size: 20px; }
          .bookmark-section-head h2 { font-size: 27px; }
          .bookmark-section-head > div:first-child > p:last-child { font-size: 11px; }
          .progress-card { gap: 11px; padding: 8px; }
          .progress-card-icon { width: 52px; height: 52px; flex-basis: 52px; font-size: 23px; }
          .progress-percent { display: none; }
          .progress-line { width: 100%; }
          .starred-grid { gap: 10px; }
          .starred-card {
            flex-basis: 100%;
            width: 100%;
          }
          .bookmark-empty { align-items: flex-start; }
        }
      `}
      </style>
    </div>
  );
}
