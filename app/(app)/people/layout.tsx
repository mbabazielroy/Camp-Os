import { PeopleTabs } from "@/components/people/PeopleTabs";

export default function PeopleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PeopleTabs />
      {children}
    </div>
  );
}
