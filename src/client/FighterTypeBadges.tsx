import { map } from "lodash-es"
import { replaceByWildlife } from "~/utils/replaceByWildlife"
import { type FighterForChip } from "./FighterChip"
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
  fighter: FighterForChip
  showTypes?: boolean
  showAbility?: boolean
  showNature?: boolean
  size?: "small" | "big"
  className?: string
}) => {
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
          title={"Nature"}
          icon={natureIcon}
          content={fighter.fighter.nature}
          size={size}
          className={className}
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
