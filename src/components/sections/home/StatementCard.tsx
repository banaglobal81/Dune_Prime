import { CountUp } from "@/components/motion/CountUp";
import { SAMPLE_STATEMENT, statementTotals, type ChannelKey } from "@/content/sample-statement";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import styles from "./StatementCard.module.css";

/** Platform names stay in English in every language; "direct" is translated. */
const CHANNEL_NAMES: Record<Exclude<ChannelKey, "direct">, string> = {
  airbnb: "Airbnb",
  booking: "Booking.com",
};

interface StatementCardProps {
  locale: Locale;
  copy: Dictionary["home"]["operating"]["statement"];
}

/** A designed sample of the monthly statement each home produces, clearly marked as a sample. */
export function StatementCard({ locale, copy }: StatementCardProps) {
  const statement = SAMPLE_STATEMENT;
  const totals = statementTotals(statement);
  const aed = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "AED",
    currencyDisplay: "code",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const channelName = (key: ChannelKey) => (key === "direct" ? copy.direct : CHANNEL_NAMES[key]);
  const channelSummary = statement.channels
    .map((channel) => `${channelName(channel.key)} ${channel.share}%`)
    .join(", ");

  return (
    <article className={styles.card} aria-labelledby="statement-title" data-reveal>
      <header className={styles.header}>
        <div>
          <span className={`lab ${styles.badge}`}>{copy.eyebrow}</span>
          <h3 id="statement-title" className={styles.title}>
            {copy.title}
          </h3>
          <p className={styles.home}>{copy.home}</p>
        </div>
        <span className={styles.period}>{copy.period}</span>
      </header>

      <div className={styles.block}>
        <h4 className={`lab ${styles.blockTitle}`}>{copy.revenue}</h4>
        <dl className={styles.rows}>
          <div>
            <dt>{copy.nightsBooked}</dt>
            <dd>
              {copy.nightsValue
                .replace("{booked}", String(statement.nightsBooked))
                .replace("{total}", String(statement.nightsAvailable))}
            </dd>
          </div>
          <div>
            <dt>{copy.occupancy}</dt>
            <dd>{totals.occupancy}%</dd>
          </div>
          <div>
            <dt>{copy.averageRate}</dt>
            <dd>{aed.format(statement.averageRate)}</dd>
          </div>
          <div className={styles.total}>
            <dt>{copy.gross}</dt>
            <dd>
              <CountUp value={aed.format(totals.revenue)} />
            </dd>
          </div>
        </dl>

        <p className={`lab ${styles.blockTitle} ${styles.channelsTitle}`}>{copy.channels}</p>
        <div className={styles.bar} role="img" aria-label={`${copy.channels}: ${channelSummary}`}>
          {statement.channels.map((channel) => (
            <span
              key={channel.key}
              className={styles[channel.key]}
              style={{ width: `${channel.share}%` }}
            />
          ))}
        </div>
        <ul className={styles.legend} aria-hidden="true">
          {statement.channels.map((channel) => (
            <li key={channel.key}>
              <span className={`${styles.swatch} ${styles[channel.key]}`} />
              {channelName(channel.key)} {channel.share}%
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.block}>
        <h4 className={`lab ${styles.blockTitle}`}>{copy.costs}</h4>
        <dl className={styles.rows}>
          {statement.costs.map((cost) => (
            <div key={cost.key}>
              <dt>{copy[cost.key]}</dt>
              <dd>{aed.format(cost.amount)}</dd>
            </div>
          ))}
          <div className={styles.total}>
            <dt>{copy.totalCosts}</dt>
            <dd>{aed.format(totals.costs)}</dd>
          </div>
        </dl>
      </div>

      <div className={styles.net}>
        <span className="lab">{copy.net}</span>
        <strong className={styles.netValue}>
          <CountUp value={aed.format(totals.net)} />
        </strong>
      </div>

      <dl className={styles.records}>
        <div>
          <dt>{copy.permit}</dt>
          <dd>{copy.permitValid}</dd>
        </div>
        <div>
          <dt>{copy.rating}</dt>
          <dd>{statement.guestRating.toFixed(1)} / 5</dd>
        </div>
      </dl>

      <p className={styles.note}>{copy.note}</p>
    </article>
  );
}
