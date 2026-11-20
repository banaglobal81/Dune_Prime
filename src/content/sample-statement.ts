/**
 * Figures for the sample monthly statement on the home page ("Every dirham, accounted for").
 *
 * ILLUSTRATIVE ONLY: they show the statement format, not a real home, a forecast or a
 * promise of returns. Totals and the net result are calculated, so edit only the inputs here.
 */

export type CostKey = "rent" | "cleaning" | "platformFees" | "utilities" | "supplies";
export type ChannelKey = "airbnb" | "booking" | "direct";

export interface SampleStatement {
  nightsBooked: number;
  nightsAvailable: number;
  /** Average nightly rate, AED. */
  averageRate: number;
  /** Share of booked nights per channel, in percent (adds up to 100). */
  channels: ReadonlyArray<{ key: ChannelKey; share: number }>;
  /** Monthly costs, AED, in display order. */
  costs: ReadonlyArray<{ key: CostKey; amount: number }>;
  guestRating: number;
}

export const SAMPLE_STATEMENT: SampleStatement = {
  nightsBooked: 22,
  nightsAvailable: 30,
  averageRate: 650,
  channels: [
    { key: "airbnb", share: 55 },
    { key: "booking", share: 30 },
    { key: "direct", share: 15 },
  ],
  costs: [
    { key: "rent", amount: 8500 },
    { key: "cleaning", amount: 1320 },
    { key: "platformFees", amount: 2145 },
    { key: "utilities", amount: 650 },
    { key: "supplies", amount: 300 },
  ],
  guestRating: 4.8,
};

/** Derived figures, so the statement always adds up. */
export function statementTotals(statement: SampleStatement) {
  const revenue = statement.nightsBooked * statement.averageRate;
  const costs = statement.costs.reduce((sum, cost) => sum + cost.amount, 0);
  return {
    revenue,
    costs,
    net: revenue - costs,
    occupancy: Math.round((statement.nightsBooked / statement.nightsAvailable) * 100),
  };
}
