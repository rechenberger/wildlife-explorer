import { formatDistance } from "date-fns"
import { useEffect, useState } from "react"
// import { diffrence } from "date-fns";

const timeAgo = ({ date, addSuffix }: { date: Date; addSuffix: boolean }) => {
  return formatDistance(date, new Date(), { addSuffix })
}

export const TimeAgo = ({
  date,
  addSuffix,
}: {
  date: Date
  addSuffix: boolean
}) => {
  const [timeAgoState, setTimeAgoState] = useState(timeAgo({ date, addSuffix }))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgoState(timeAgo({ date, addSuffix }))
    }, 1000)

    return () => clearInterval(interval)
  }, [date, addSuffix])

  return <span title={date.toLocaleString()}>{timeAgoState}</span>
}
