import { notFound } from "next/navigation";
import { AdminHoroscopeEditor } from "@/features/admin/components/admin-horoscope-editor";
import { zodiacSigns } from "@/features/horoscopes/data/horoscopes";
import type { HoroscopePeriod, ZodiacSign } from "@/features/horoscopes/types/horoscope";

const periods: HoroscopePeriod[] = ["daily", "weekly", "monthly"];
export default async function HoroscopeEditorPage({ params, searchParams }: { params: Promise<{ period: string; sign: string }>; searchParams: Promise<{ date?: string }> }) {
  const { period, sign } = await params;
  const { date } = await searchParams;
  if (!periods.includes(period as HoroscopePeriod) || !zodiacSigns.some((item) => item.key === sign) || !date) notFound();
  return <AdminHoroscopeEditor period={period as HoroscopePeriod} sign={sign as ZodiacSign} date={date} />;
}
