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
    <div className="flex h-full w-full max-w-sm mx-auto bg-white shadow-md rounded-lg flex-col content-center items-center p-4">
      <div className="flex flex-col pb-5">
        <h1 className="text-xl font-semibold items-center content-center">
          {heading}
        </h1>
        {description ? (
          <h3 className="text-lg text-gray-700 items-center mt-2">
            {description}
          </h3>
        ) : null}
      </div>
      <p className="text-2xl font-bold content-center items-center justify-center text-center mt-4 pt-4 ">
        {value}
      </p>
    </div>
  );
};

export default StatDisplay;
