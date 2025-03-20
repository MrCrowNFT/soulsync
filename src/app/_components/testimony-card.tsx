import type { FunctionComponent } from "react";
import type { TestimonyCardProps } from "@/types/testimony";
import Image from "next/image";

const TestimonyCard: FunctionComponent<TestimonyCardProps> = ({
  testimony,
}) => {
  return (
    <div className="max-w-3xs flex flex-col items-center rounded-lg bg-white p-6 shadow-lg transition-colors duration-300 dark:bg-gray-800">
      <div className="mb-4">
        <Image
          src={testimony.photo}
          alt="testimony photo"
          className="h-24 w-24 rounded-full border-zinc-600 object-cover shadow-md dark:border-gray-500"
        />
      </div>
      <div className="space-y-2 text-center">
        <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
          {testimony.username}
        </p>
        <p className="italic text-gray-600 dark:text-gray-300">
          <i>&quot{testimony.opinion}&quot</i>
        </p>
      </div>
    </div>
  );
};

export default TestimonyCard;
