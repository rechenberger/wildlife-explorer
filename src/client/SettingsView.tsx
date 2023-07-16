import { map } from "lodash-es"
import { Label } from "./shadcn/ui/label"
import { RadioGroup, RadioGroupItem } from "./shadcn/ui/radio-group"
import { useSettingsMapStyle } from "./useSettingsMapStyle"

export const SettingsView = () => {
  const { mapStyleOptions, mapStyleKey, setMapStyleKey } = useSettingsMapStyle()
  return (
    <>
      <div className="flex flex-col gap-4">
        <div>Settings</div>
        <div className="flex flex-col gap-2">
          <div className="text-xs font-bold">Map Style</div>
          <RadioGroup
            value={mapStyleKey}
            onValueChange={(v) => {
              setMapStyleKey(v)
            }}
          >
            {map(mapStyleOptions, (option) => (
              <div key={option.key} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.key}
                  id={`mapStyleKey-${option.key}`}
                />
                <Label htmlFor={`mapStyleKey-${option.key}`}>
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </>
  )
}
