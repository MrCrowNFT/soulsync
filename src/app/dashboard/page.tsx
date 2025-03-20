import { moodGraphMock } from "@/mocks/graph.mock";
import Assessment from "../_components/assessment";
import MoodGraph from "../_components/mood-graph";
import UserCard from "../_components/user-card";
import { mockAssessmentData } from "@/mocks/assessment.mock";

const Dashboard = () => {
  return (
    <>
      <UserCard user={} />
      <div className="flex">
        <MoodGraph data={moodGraphMock} />
        <Assessment assessment={mockAssessmentData} />
      </div>
    </>
  );
};
export default Dashboard;
