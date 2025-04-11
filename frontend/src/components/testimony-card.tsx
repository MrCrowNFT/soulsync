import type { FunctionComponent } from "react";

interface TestimonyCardProps {
  testimony: {
    photo: string;
    username: string;
    opinion: string;
  };
}

const TestimonyCard: FunctionComponent<TestimonyCardProps> = ({
  testimony,
}) => {
  return (
    <div className="max-w-xs flex flex-col items-center rounded-lg bg-white p-6 shadow-lg transition-colors duration-300 dark:bg-gray-800">
      <div className="mb-4">
        <img
          src={testimony.photo}
          alt="testimony photo"
          className="h-24 w-24 rounded-full object-cover shadow-md"
        />
      </div>
      <div className="space-y-2 text-center">
        <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
          {testimony.username}
        </p>
        <p className="italic text-gray-600 dark:text-gray-300">
          <i>&quot;{testimony.opinion}&quot;</i>
        </p>
      </div>
    </div>
  );
};

export default TestimonyCard;
