import { SessionGate } from "./SessionGate";

interface Props {
  params: Promise<{ tableNumber: string }>;
}

export default async function MenuPage({ params }: Props) {
  const { tableNumber } = await params;

  return <SessionGate tableNumber={tableNumber} />;
}
