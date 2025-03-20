import Assessment from "../_components/assessment";
import MoodGraph from "../_components/mood-graph";
import UserCard from "../_components/user-card";

const Dashboard = () => {
  return (
    <>
      <UserCard user={} />
      <div className="flex">
        <MoodGraph data={} />
        <Assessment assessment={} />
      </div>
    </>
  );
};
export default Dashboard;
