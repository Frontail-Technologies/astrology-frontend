import { notFound } from "next/navigation";

import { AdminHoroscopeEditor } from "@/features/admin/components/horoscopes/admin-horoscope-editor";
import { isHoroscopePeriod, isZodiacSign } from "@/features/horoscopes/constants/horoscope-status";
import { normalizeGridDate } from "@/features/horoscopes/state/horoscope-grid-state";

export default async function HoroscopeEditorPage({ params, searchParams }: { params: Promise<{ period: string; sign: string }>; searchParams: Promise<{ date?: string }> }) {
  const { period, sign } = await params;
  const { date } = await searchParams;
  if (!isHoroscopePeriod(period) || !isZodiacSign(sign)) notFound();
  const start = normalizeGridDate(period, date);
  if (!start) notFound();
  return <AdminHoroscopeEditor period={period} sign={sign} date={start} />;
}
