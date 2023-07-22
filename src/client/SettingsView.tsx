import NiceModal from "@ebay/nice-modal-react"
import { map } from "lodash-es"
import { ArrowLeftRight, Network } from "lucide-react"
import Link from "next/link"
import { Fragment } from "react"
import { TaxonOverviewModal } from "./TaxonOverviewModal"
import { cn } from "./cn"
import { Button } from "./shadcn/ui/button"
import { Label } from "./shadcn/ui/label"
import { RadioGroup, RadioGroupItem } from "./shadcn/ui/radio-group"
import { useSettingsMapStyle } from "./useSettingsMapStyle"

export const SettingsView = () => {
  const { mapStyleOptions, mapStyleKey, setMapStyleKey } = useSettingsMapStyle()
  return (
    <>
      <div className="flex flex-col gap-8">
        <div>Settings</div>
        <div className="flex flex-col gap-2">
          <div className="text-xs font-bold">Map Style</div>
          <RadioGroup
            value={mapStyleKey}
            onValueChange={(v) => {
              setMapStyleKey(v)
            }}
            className="grid grid-cols-2 gap-2"
          >
            {map(mapStyleOptions, (option) => (
              <Fragment
                key={option.key}
                // className="flex items-center space-x-2"
              >
                <Label
                  htmlFor={`mapStyleKey-${option.key}`}
                  className={cn(
                    "flex flex-col rounded-xl overflow-hidden border",
                    option.key === mapStyleKey && "ring ring-slate-800"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={option.imgUrl}
                    className="aspect-[120/50]"
                    alt={option.label}
                  />
                  <div className="flex flex-row gap-2 items-2 px-2 py-2">
                    <RadioGroupItem
                      value={option.key}
                      id={`mapStyleKey-${option.key}`}
                    />
                    <div>{option.label}</div>
                  </div>
                </Label>
              </Fragment>
            ))}
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-xs font-bold">Character</div>
          <Link href="/" className="flex flex-col">
            <Button>
              <ArrowLeftRight className="w-4 h-4 mr-1" />
              <div>Switch Character</div>
            </Button>
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-xs font-bold">More</div>
          <Button
            onClick={() => {
              NiceModal.show(TaxonOverviewModal, {
                taxonId: 1,
              })
            }}
          >
            <Network className="w-4 h-4 mr-1" />
            <div>Taxon Overview</div>
          </Button>
        </div>
      </div>
    </>
  )
}
