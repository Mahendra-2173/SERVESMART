export const DEFAULT_RECORDS = [
  { date: "2026-10-05", day: "Monday", weather: "Sunny", student_count: 78, prepared_quantity: 90, remaining_quantity: 8, sold_quantity: 82, sold_out: false, snack_type: "Samosa" },
  { date: "2026-10-06", day: "Tuesday", weather: "Sunny", student_count: 82, prepared_quantity: 95, remaining_quantity: 7, sold_quantity: 88, sold_out: false, snack_type: "Samosa" },
  { date: "2026-10-07", day: "Wednesday", weather: "Cloudy", student_count: 74, prepared_quantity: 85, remaining_quantity: 11, sold_quantity: 74, sold_out: false, snack_type: "Bread Pakora" },
  { date: "2026-10-08", day: "Thursday", weather: "Rainy", student_count: 92, prepared_quantity: 100, remaining_quantity: 0, sold_quantity: 100, sold_out: true, snack_type: "Onion Pakora" },
  { date: "2026-10-09", day: "Friday", weather: "Sunny", student_count: 104, prepared_quantity: 110, remaining_quantity: 4, sold_quantity: 106, sold_out: false, snack_type: "Samosa" },
  { date: "2026-10-10", day: "Saturday", weather: "Sunny", student_count: 62, prepared_quantity: 75, remaining_quantity: 18, sold_quantity: 57, sold_out: false, snack_type: "Aloo Bonda" },
  { date: "2026-10-11", day: "Sunday", weather: "Cloudy", student_count: 44, prepared_quantity: 60, remaining_quantity: 16, sold_quantity: 44, sold_out: false, snack_type: "Bread Pakora" },
  { date: "2026-10-12", day: "Monday", weather: "Sunny", student_count: 85, prepared_quantity: 95, remaining_quantity: 6, sold_quantity: 89, sold_out: false, snack_type: "Samosa" },
  { date: "2026-10-13", day: "Tuesday", weather: "Drizzle", student_count: 96, prepared_quantity: 105, remaining_quantity: 0, sold_quantity: 105, sold_out: true, snack_type: "Bread Pakora" },
  { date: "2026-10-14", day: "Wednesday", weather: "Sunny", student_count: 80, prepared_quantity: 90, remaining_quantity: 9, sold_quantity: 81, sold_out: false, snack_type: "Samosa" },
  { date: "2026-10-15", day: "Thursday", weather: "Cloudy", student_count: 88, prepared_quantity: 95, remaining_quantity: 5, sold_quantity: 90, sold_out: false, snack_type: "Veg Cutlet" },
  { date: "2026-10-16", day: "Friday", weather: "Rainy", student_count: 112, prepared_quantity: 110, remaining_quantity: 0, sold_quantity: 110, sold_out: true, snack_type: "Samosa" },
  { date: "2026-10-17", day: "Saturday", weather: "Cloudy", student_count: 58, prepared_quantity: 70, remaining_quantity: 14, sold_quantity: 56, sold_out: false, snack_type: "Onion Pakora" },
  { date: "2026-10-18", day: "Sunday", weather: "Sunny", student_count: 40, prepared_quantity: 55, remaining_quantity: 13, sold_quantity: 42, sold_out: false, snack_type: "Aloo Bonda" },
  { date: "2026-10-19", day: "Monday", weather: "Sunny", student_count: 81, prepared_quantity: 90, remaining_quantity: 7, sold_quantity: 83, sold_out: false, snack_type: "Samosa" },
  { date: "2026-10-20", day: "Tuesday", weather: "Cloudy", student_count: 76, prepared_quantity: 85, remaining_quantity: 8, sold_quantity: 77, sold_out: false, snack_type: "Veg Cutlet" },
  { date: "2026-10-21", day: "Wednesday", weather: "Rainy", student_count: 95, prepared_quantity: 95, remaining_quantity: 0, sold_quantity: 95, sold_out: true, snack_type: "Onion Pakora" },
  { date: "2026-10-22", day: "Thursday", weather: "Sunny", student_count: 84, prepared_quantity: 95, remaining_quantity: 10, sold_quantity: 85, sold_out: false, snack_type: "Samosa" },
  { date: "2026-10-23", day: "Friday", weather: "Sunny", student_count: 108, prepared_quantity: 115, remaining_quantity: 5, sold_quantity: 110, sold_out: false, snack_type: "Samosa" },
  { date: "2026-10-24", day: "Saturday", weather: "Sunny", student_count: 66, prepared_quantity: 75, remaining_quantity: 11, sold_quantity: 64, sold_out: false, snack_type: "Bread Pakora" },
  { date: "2026-10-25", day: "Sunday", weather: "Rainy", student_count: 48, prepared_quantity: 60, remaining_quantity: 6, sold_quantity: 54, sold_out: false, snack_type: "Aloo Bonda" },
  { date: "2026-10-26", day: "Monday", weather: "Sunny", student_count: 79, prepared_quantity: 90, remaining_quantity: 9, sold_quantity: 81, sold_out: false, snack_type: "Samosa" },
  { date: "2026-10-27", day: "Tuesday", weather: "Sunny", student_count: 86, prepared_quantity: 95, remaining_quantity: 5, sold_quantity: 90, sold_out: false, snack_type: "Samosa" },
  { date: "2026-10-28", day: "Wednesday", weather: "Cloudy", student_count: 83, prepared_quantity: 90, remaining_quantity: 6, sold_quantity: 84, sold_out: false, snack_type: "Veg Cutlet" }
];

export const DEFAULT_STATS = {
  total_observations: 24,
  avg_daily_consumption: 81.1,
  avg_leftover_quantity: 7.4,
  avg_prepared_quantity: 88.5,
  avg_student_count: 79.2,
  highest_demand_day: "Friday (110 portions - Samosa)",
  highest_demand_value: 110,
  lowest_demand_day: "Sunday (42 portions - Aloo Bonda)",
  lowest_demand_value: 42,
  days_ran_out: 4,
  days_excess: 20,
  wastage_rate_percent: 8.4,
  stockout_rate_percent: 16.7
};

export const DEFAULT_ANALYTICS = {
  by_day: [
    { day: "Monday", avg_student_count: 80.8, avg_prepared: 91.2, avg_sold: 83.8, avg_remaining: 7.5, sample_size: 4 },
    { day: "Tuesday", avg_student_count: 85.0, avg_prepared: 95.0, avg_sold: 90.0, avg_remaining: 5.0, sample_size: 4 },
    { day: "Wednesday", avg_student_count: 83.0, avg_prepared: 90.0, avg_sold: 83.5, avg_remaining: 6.5, sample_size: 4 },
    { day: "Thursday", avg_student_count: 88.0, avg_prepared: 96.7, avg_sold: 91.7, avg_remaining: 5.0, sample_size: 3 },
    { day: "Friday", avg_student_count: 108.0, avg_prepared: 111.7, avg_sold: 108.7, avg_remaining: 3.0, sample_size: 3 },
    { day: "Saturday", avg_student_count: 62.0, avg_prepared: 73.3, avg_sold: 59.0, avg_remaining: 14.3, sample_size: 3 },
    { day: "Sunday", avg_student_count: 44.0, avg_prepared: 58.3, avg_sold: 46.7, avg_remaining: 11.7, sample_size: 3 }
  ],
  by_weather: [
    { weather: "Sunny", avg_student_count: 79.6, avg_sold: 81.4, avg_remaining: 8.6, stockouts: 0, sample_size: 13 },
    { weather: "Cloudy", avg_student_count: 70.5, avg_sold: 70.8, avg_remaining: 10.0, stockouts: 0, sample_size: 6 },
    { weather: "Rainy", avg_student_count: 86.8, avg_sold: 89.8, avg_remaining: 1.5, stockouts: 3, sample_size: 4 },
    { weather: "Drizzle", avg_student_count: 96.0, avg_sold: 105.0, avg_remaining: 0.0, stockouts: 1, sample_size: 1 }
  ],
  turnout_vs_consumption: DEFAULT_RECORDS.map(r => ({
    date: r.date,
    day: r.day,
    weather: r.weather,
    student_count: r.student_count,
    sold_quantity: r.sold_quantity,
    snack_type: r.snack_type
  })),
  prepared_vs_sold_timeline: DEFAULT_RECORDS.map(r => ({
    date: r.date,
    day: r.day.slice(0, 3),
    prepared: r.prepared_quantity,
    sold: r.sold_quantity,
    remaining: r.remaining_quantity,
    sold_out: r.sold_out,
    snack_type: r.snack_type
  }))
};
