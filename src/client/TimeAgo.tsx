import { formatDistance } from "date-fns"
import { useEffect, useState } from "react"
// import { diffrence } from "date-fns";

const timeAgo = (date: Date) => {
  return formatDistance(date, new Date(), { addSuffix: true })
}

export const TimeAgo = ({ date }: { date: Date }) => {
  const [timeAgoState, setTimeAgoState] = useState(timeAgo(date))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgoState(timeAgo(date))
    }, 1000)

    return () => clearInterval(interval)
  }, [date])

  return <span title={date.toLocaleString()}>{timeAgoState}</span>
}
