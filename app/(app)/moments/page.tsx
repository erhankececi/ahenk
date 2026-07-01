import { TopBar } from "@/components/TopBar";
import StoriesBar from "@/components/StoriesBar";
import MomentsFeed from "@/components/MomentsFeed";

export const dynamic = "force-dynamic";

export default function MomentsPage() {
  return (
    <div className="pb-6">
      <TopBar title="Moments" create />
      <div className="px-4 lg:mx-auto lg:max-w-6xl lg:px-6">
        <StoriesBar />
        <MomentsFeed />
      </div>
    </div>
  );
}
