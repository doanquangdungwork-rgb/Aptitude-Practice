"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { appCatalog } from "../../lib/data";
import { getAttempts, getStarredTests, toggleStarredTest } from "../../lib/progress";

export default function Bookmarks() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [stars, setStars] = useState<string[]>([]);

  useEffect(() => {
    setAttempts(getAttempts());
    setStars(getStarredTests());
  }, []);

  const unfinished = attempts
    .filter((a) => !a.completedAt)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  const starred = appCatalog.tests.filter((t: any) => stars.includes(t.test_id));

  const testName = (id: string) =>
    appCatalog.tests.find((t: any) => t.test_id === id);

  const refreshStars = () => setStars(getStarredTests());

  return (
    <div className="app-page bookmarks-page">
      <header className="bookmarks-hero">
        <div>
          <p className="eyebrow">Your library</p>
          <h1>Things worth coming back to.</h1>
          <p className="bookmarks-lede">
            Unfinished sessions and favourite tests, kept together.
          </p>
        </div>

        <Link href="/practice" className="bookmarks-browse">
          Browse practice →
        </Link>
      </header>

      <section className="bookmark-section">
        <div className="bookmark-section-head">
          <div>
            <p className="eyebrow">01 · Continue</p>
            <h2>In progress</h2>
            <p>Pick up where you left off. Your unfinished tests are saved here.</p>
          </div>
          <div className="bookmark-count">
            <strong>{unfinished.length}</strong>
            <span>in progress</span>
          </div>
        </div>

        {unfinished.length ? (
          <div className="bookmark-list">
            {unfinished.map((a: any) => (
              <Link
                key={a.id}
                href={`/tests/${a.testId}`}
                className="bookmark-test-row"
              >
                <div className="bookmark-icon bookmark-icon-clock">◷</div>
                <div className="bookmark-row-copy">
                  <span className="bookmark-row-kicker">
                    {testName(a.testId)?.title?.replaceAll("_", " ") || a.testId}
                  </span>
                  <strong>Continue where you left off</strong>
                  <span>Return to your unfinished test and keep your progress.</span>
                </div>
                <span className="bookmark-row-arrow">→</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bookmark-empty">
            <div className="bookmark-icon">◷</div>
            <div className="bookmark-empty-copy">
              <strong>No unfinished tests.</strong>
              <p>
                Start one from the practice library and it will appear here so
                you can continue later.
              </p>
              <Link href="/practice" className="yellow-button">
                Browse tests
              </Link>
            </div>
          </div>
        )}
      </section>

      <section className="bookmark-section">
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
          <div className="starred-grid">
            {starred.map((t: any, i: number) => (
              <article
                key={t.test_id}
                className={`starred-card tone-${["pink", "lavender", "lime", "mint", "sky", "peach"][i % 6]}`}
              >
                <button
                  type="button"
                  className="starred-card-star"
                  aria-label="Remove bookmark"
                  onClick={() => {
                    toggleStarredTest(t.test_id);
                    refreshStars();
                  }}
                >
                  ★
                </button>
                <Link href={`/tests/${t.test_id}`}>
                  <span className="practice-index">
                    {t.test_id.replace("TEST_", "")}
                  </span>
                  <h3>{t.title.replaceAll("_", " ")}</h3>
                  <p>{t.question_count} questions</p>
                  <span className="starred-card-arrow">→</span>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="bookmark-empty">
            <div className="bookmark-icon bookmark-icon-star">☆</div>
            <div className="bookmark-empty-copy">
              <strong>Nothing starred yet.</strong>
              <p>Tap ☆ on any test in the practice library to keep it here.</p>
              <Link href="/tests" className="yellow-button">
                Browse tests
              </Link>
            </div>
          </div>
        )}
      </section>

      <aside className="bookmark-tip">
        <div className="bookmark-icon bookmark-icon-tip">♧</div>
        <div>
          <span>TIP</span>
          <p>
            Star tests you want to revisit later — they’ll appear here for quick
            access.
          </p>
        </div>
      </aside>

      <style jsx>{`
        .bookmarks-page {
          width: min(1145px, 100%);
          padding-top: 38px;
          padding-bottom: 64px;
        }

        .bookmarks-hero {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          padding: 24px 0 24px;
          border-bottom: 1px solid var(--line);
        }

        .bookmarks-hero h1 {
          margin-top: 7px;
          font-size: clamp(36px, 4vw, 48px);
          line-height: 1;
          letter-spacing: -0.055em;
          font-weight: 500;
        }

        .bookmarks-lede {
          margin-top: 10px;
          font-size: 13px;
          line-height: 1.5;
          color: var(--muted);
        }

        .bookmarks-browse {
          flex: 0 0 auto;
          padding-bottom: 3px;
          border-bottom: 1px solid #cfcac0;
          color: #99968f;
          font-size: 11px;
          text-decoration: none;
          white-space: nowrap;
        }

        .bookmark-section {
          padding: 26px 0 28px;
          border-bottom: 1px solid var(--line);
        }

        .bookmark-section-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 28px;
        }

        .bookmark-section-head h2 {
          margin-top: 7px;
          font-size: 29px;
          line-height: 1;
          letter-spacing: -0.045em;
          font-weight: 500;
        }

        .bookmark-section-head > div:first-child > p:last-child {
          margin-top: 9px;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.5;
        }

        .bookmark-count {
          flex: 0 0 auto;
          min-width: 48px;
          text-align: right;
          padding-bottom: 2px;
        }

        .bookmark-count strong {
          display: block;
          font-size: 18px;
          line-height: 1;
          font-weight: 500;
          letter-spacing: -0.04em;
        }

        .bookmark-count span {
          display: block;
          margin-top: 6px;
          color: var(--muted);
          font-size: 9px;
        }

        .bookmark-empty {
          display: flex;
          align-items: flex-start;
          gap: 28px;
          margin-top: 25px;
          min-height: 168px;
          padding: 25px 28px;
          border: 1px dashed #d8d4cb;
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.38);
        }

        .bookmark-icon {
          width: 58px;
          height: 58px;
          flex: 0 0 58px;
          display: grid;
          place-items: center;
          border: 1px solid #e4e0d8;
          border-radius: 50%;
          background: #f7f5ef;
          color: #30312e;
          font-size: 29px;
          line-height: 1;
        }

        .bookmark-icon-star {
          font-size: 34px;
          font-weight: 300;
        }

        .bookmark-empty-copy {
          padding-top: 1px;
          max-width: 580px;
        }

        .bookmark-empty-copy strong {
          display: block;
          font-size: 15px;
          line-height: 1.3;
          font-weight: 500;
        }

        .bookmark-empty-copy p {
          max-width: 570px;
          margin-top: 6px;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.55;
        }

        .bookmark-empty-copy .yellow-button {
          margin-top: 17px;
          text-decoration: none;
        }

        .bookmark-list {
          margin-top: 25px;
          border-top: 1px solid var(--line);
        }

        .bookmark-test-row {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 17px 4px;
          border-bottom: 1px solid var(--line);
          text-decoration: none;
          color: inherit;
        }

        .bookmark-test-row .bookmark-icon {
          width: 44px;
          height: 44px;
          flex-basis: 44px;
          font-size: 22px;
        }

        .bookmark-row-copy {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .bookmark-row-kicker {
          color: var(--muted);
          font-size: 10px;
        }

        .bookmark-row-copy strong {
          font-size: 14px;
          font-weight: 500;
        }

        .bookmark-row-copy > span:last-child {
          color: var(--muted);
          font-size: 11px;
        }

        .bookmark-row-arrow {
          margin-left: auto;
          color: #55534e;
          font-size: 18px;
        }

        .starred-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-top: 25px;
        }

        .starred-card {
          position: relative;
          min-height: 178px;
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 15px;
          background: #fff;
        }

        .starred-card::after {
          content: "";
          position: absolute;
          right: -18px;
          top: 14px;
          width: 68px;
          height: 55px;
          border-radius: 50%;
          opacity: 0.78;
        }

        .starred-card.tone-pink::after { background: var(--pink); }
        .starred-card.tone-lavender::after { background: var(--lav); }
        .starred-card.tone-lime::after { background: #e4ef9a; }
        .starred-card.tone-mint::after { background: var(--mint); }
        .starred-card.tone-sky::after { background: var(--sky); }
        .starred-card.tone-peach::after { background: var(--peach); }

        .starred-card > a {
          display: block;
          height: 100%;
          padding: 20px;
          text-decoration: none;
          color: inherit;
        }

        .starred-card h3 {
          max-width: 210px;
          margin-top: 17px;
          font-size: 19px;
          line-height: 1.08;
          letter-spacing: -0.035em;
          font-weight: 500;
        }

        .starred-card p {
          margin-top: 8px;
          color: var(--muted);
          font-size: 11px;
        }

        .starred-card-star {
          position: absolute;
          z-index: 2;
          top: 15px;
          right: 17px;
          border: 0;
          background: transparent;
          color: #3f3e39;
          font-size: 17px;
          cursor: pointer;
        }

        .starred-card-arrow {
          position: absolute;
          right: 16px;
          bottom: 14px;
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border: 1px solid #ddd9d1;
          border-radius: 50%;
          background: #fff;
          font-size: 15px;
        }

        .bookmark-tip {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-top: 22px;
          padding: 16px 20px;
          border: 1px solid var(--line);
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.46);
        }

        .bookmark-tip .bookmark-icon {
          width: 44px;
          height: 44px;
          flex-basis: 44px;
          font-size: 25px;
        }

        .bookmark-tip span {
          display: block;
          color: #77736b;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
        }

        .bookmark-tip p {
          margin-top: 4px;
          color: #66635d;
          font-size: 11px;
          line-height: 1.45;
        }


        @media (min-width: 901px) {
          .bookmarks-page {
            padding-top: 18px;
            padding-bottom: 18px;
          }

          .bookmarks-hero {
            padding: 14px 0 16px;
          }

          .bookmarks-hero h1 {
            margin-top: 5px;
          }

          .bookmarks-lede {
            margin-top: 7px;
            font-size: 11px;
          }

          .bookmark-section {
            padding: 17px 0 18px;
          }

          .bookmark-section-head h2 {
            margin-top: 5px;
            font-size: 25px;
          }

          .bookmark-section-head > div:first-child > p:last-child {
            margin-top: 6px;
            font-size: 10px;
          }

          .bookmark-empty {
            margin-top: 16px;
            min-height: 108px;
            padding: 16px 20px;
            gap: 20px;
          }

          .bookmark-icon {
            width: 48px;
            height: 48px;
            flex-basis: 48px;
            font-size: 25px;
          }

          .bookmark-icon-star {
            font-size: 29px;
          }

          .bookmark-empty-copy strong {
            font-size: 14px;
          }

          .bookmark-empty-copy p {
            margin-top: 4px;
            font-size: 10px;
          }

          .bookmark-empty-copy .yellow-button {
            margin-top: 10px;
          }

          .bookmark-list {
            margin-top: 16px;
          }

          .bookmark-test-row {
            padding: 11px 4px;
          }

          .starred-grid {
            margin-top: 16px;
          }

          .starred-card {
            min-height: 130px;
          }

          .starred-card > a {
            padding: 15px;
          }

          .starred-card h3 {
            margin-top: 12px;
            font-size: 17px;
          }

          .starred-card p {
            margin-top: 5px;
            font-size: 10px;
          }

          .bookmark-tip {
            margin-top: 14px;
            padding: 10px 14px;
          }

          .bookmark-tip .bookmark-icon {
            width: 38px;
            height: 38px;
            flex-basis: 38px;
            font-size: 21px;
          }

          .bookmark-tip p {
            font-size: 10px;
          }
        }

        @media (max-width: 900px) {
          .bookmarks-page {
            padding-top: 20px;
            padding-bottom: 45px;
          }

          .bookmarks-hero {
            align-items: flex-start;
            flex-direction: column;
            gap: 18px;
          }

          .bookmarks-hero h1 {
            font-size: 36px;
          }

          .bookmark-section {
            padding-top: 23px;
            padding-bottom: 24px;
          }

          .bookmark-empty {
            gap: 18px;
            padding: 20px;
          }

          .starred-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 560px) {
          .bookmarks-page {
            padding-left: 16px;
            padding-right: 16px;
          }

          .bookmarks-hero h1 {
            font-size: 32px;
          }

          .bookmark-section-head {
            align-items: flex-start;
          }

          .bookmark-section-head h2 {
            font-size: 26px;
          }

          .bookmark-count {
            padding-top: 4px;
          }

          .bookmark-empty {
            flex-direction: column;
            gap: 14px;
            min-height: 0;
          }

          .starred-grid {
            grid-template-columns: 1fr;
          }

          .bookmark-tip {
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
