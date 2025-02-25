export function formatDDMMYY(date: Date, withTime = false) {
  const dateCopy = new Date(date);
  const day = dateCopy.getDate().toString().padStart(2, "0");
  const month = (dateCopy.getMonth() + 1).toString().padStart(2, "0");
  const year = dateCopy.getFullYear();

  if (withTime) {
    const hour = dateCopy.getHours();
    const minutes = dateCopy.getMinutes().toString().padStart(2, "0");

    if ([hour, minutes].includes(NaN)) {
      return "-/-/- -:-";
    }

    return (
      <>
        <span>
          {day}/{month}/{year}
        </span>
        <span className="text-gray-400 ml-1">
          {hour}:{minutes}
        </span>
      </>
    );
  }

  return (
    <>
      {day}/{month}/{year}
    </>
  );
}
