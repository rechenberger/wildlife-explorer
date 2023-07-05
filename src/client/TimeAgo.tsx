import { formatDistance } from "date-fns"
import { useEffect, useState } from "react"

const timeAgo = ({
  date,
  addSuffix,
}: {
  date: Date | string
  addSuffix: boolean
}) => {
  return formatDistance(new Date(date), new Date(), { addSuffix })
}

export const TimeAgo = ({
  date,
  addSuffix,
}: {
  date: Date | string
  addSuffix: boolean
}) => {
  const [timeAgoState, setTimeAgoState] = useState(timeAgo({ date, addSuffix }))

  useEffect(() => {
    setTimeAgoState(timeAgo({ date, addSuffix }))
    const interval = setInterval(() => {
      setTimeAgoState(timeAgo({ date, addSuffix }))
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [date, addSuffix])

  return <span title={new Date(date).toLocaleString()}>{timeAgoState}</span>
}
