import { TopBar } from "@/components/TopBar";
import StoriesBar from "@/components/StoriesBar";
import MomentsFeed from "@/components/MomentsFeed";

export const dynamic = "force-dynamic";

export default function MomentsPage() {
  return (
    <div className="pb-6">
      <TopBar title="Moments" create />
      <div className="px-4">
        <StoriesBar />
        <MomentsFeed />
      </div>
    </div>
  );
}
