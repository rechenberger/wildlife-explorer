import { map } from "lodash-es"
import { type BattleReportFighter } from "~/server/lib/battle/BattleReport"
import { replaceByWildlife } from "~/utils/replaceByWildlife"
import { TypeBadge } from "./TypeBadge"
import { abilityIcon, getTypeIcon, natureIcon } from "./typeIcons"

export const FighterTypeBadges = ({
  fighter,
  showTypes,
  showAbility,
  showNature,
  size,
  className,
}: {
  fighter: BattleReportFighter
  showTypes?: boolean
  showAbility?: boolean
  showNature?: boolean
  size?: "small" | "big"
  className?: string
}) => {
  const nature = fighter.fighter.nature
  const natureTooltip = `Nature:${nature.plus ? " +" + nature.plus : ""}${
    nature.minus ? " -" + nature.minus : ""
  }${!nature.plus && !nature.minus ? " neutral" : ""}`
  return (
    <>
      {showTypes && (
        <>
          {map(fighter.fighter.types, (type) => {
            const icon = getTypeIcon(type)
            return (
              <TypeBadge
                key={type}
                title={type}
                icon={icon}
                content={type}
                size={size}
                className={className}
              />
            )
          })}
        </>
      )}

      {showAbility && (
        <TypeBadge
          title={replaceByWildlife(fighter.fighter.ability.desc)}
          icon={abilityIcon}
          content={fighter.fighter.ability.name}
          size={size}
          className={className}
        />
      )}
      {showNature && (
        <TypeBadge
          icon={natureIcon}
          content={fighter.fighter.nature.name}
          size={size}
          className={className}
          title={natureTooltip}
        />
      )}

      {/* {fighter.fighter.item && (
        <TypeBadge
          title={fighter.fighter.item}
          icon={itemIcon}
          content={fighter.fighter.item}
        />
      )} */}
    </>
  )
}
