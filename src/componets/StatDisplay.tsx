"use server";

const StatDisplay = ({
  heading,
  description,
  value,
}: {
  heading: string;
  description?: string;
  value: string;
}) => {
  return (
    <div className="flex flex-col h-full w-full max-w-xs mx-auto bg-white shadow-lg rounded-lg p-4">
      <div className="flex flex-col mb-4">
        <h1 className="text-xl font-semibold text-gray-800">{heading}</h1>
        {description && (
          <h3 className="text-sm text-gray-600 mt-1">{description}</h3>
        )}
      </div>
      <div className="flex flex-1 items-center justify-center">
        <p className="text-xl font-bold text-gray-900 pt-3">{value}</p>
      </div>
    </div>
  );
};

export default StatDisplay;
