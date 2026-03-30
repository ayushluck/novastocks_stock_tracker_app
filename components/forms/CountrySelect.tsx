"use client"

import Image from "next/image"
import { useMemo, useState, type HTMLAttributes, type InputHTMLAttributes } from "react"
import countryList from "react-select-country-list"
import * as Popover from "@radix-ui/react-popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export interface CountrySelectProps {
    value: string
    onChange: (value: string) => void
    error?: string
    disabled?: boolean
}

// shadcn-like command wrapper fallback for no @radix-ui/react-command dependency
const Command = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("space-y-1", className)} {...props} />
)

const CommandInput = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
    <input
        className={cn(
            "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
            className
        )}
        {...props}
    />
)

const CommandList = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "max-h-56 overflow-auto rounded-md border border-border bg-popover p-1 text-sm shadow-lg",
            className
        )}
        {...props}
    />
)

const CommandEmpty = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("p-2 text-xs text-muted-foreground", className)} {...props} />
)

const CommandGroup = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("space-y-1", className)} {...props} />
)

const CommandItem = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex cursor-pointer items-center justify-between rounded-sm px-2 py-1 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
        )}
        {...props}
    />
)

export default function CountrySelect({ value, onChange, error, disabled }: CountrySelectProps) {
    const countries = useMemo(() => countryList().getData(), [])
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const filtered = useMemo(() => {
        const normalized = query.trim().toLowerCase()
        if (!normalized) return countries
        return countries.filter((country) => country.label.toLowerCase().includes(normalized))
    }, [countries, query])

    const selectedLabel = value ? countries.find((c) => c.value === value)?.label ?? value : ""

    const getFlagUrl = (countryValue: string, countryLabel: string): string => {
        const code = countryValue || countries.find((c) => c.label === countryLabel)?.value || ""
        const alpha2 = code.toLowerCase()
        if (!alpha2) return ""
        return `https://flagcdn.com/256x192/${alpha2}.png`
    }

    return (
        <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Popover.Root open={open} onOpenChange={setOpen}>
                <Popover.Trigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        size="default"
                        className="w-full justify-between"
                        disabled={disabled}
                        aria-label="Select country"
                    >
                        <div className="flex items-center gap-2">
                            {selectedLabel ? (
                                <Image
                                    src={getFlagUrl(value, selectedLabel)}
                                    alt={`${selectedLabel} flag`}
                                    width={24}
                                    height={18}
                                    className="inline-block rounded-sm"
                                    unoptimized
                                />
                            ) : null}
                            <span className={cn("text-left", !selectedLabel && "text-muted-foreground")}>{selectedLabel || "Select your country"}</span>
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </Popover.Trigger>
                <Popover.Content sideOffset={8} className="w-full max-w-[320px] p-2">
                    <Command>
                        <CommandInput
                            placeholder="Search country..."
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Escape") {
                                    setOpen(false)
                                }
                            }}
                            autoFocus
                        />
                        <CommandList>
                            {filtered.length === 0 ? (
                                <CommandEmpty>No countries found.</CommandEmpty>
                            ) : (
                                <CommandGroup>
                                    {filtered.map((country) => {
                                        const isSelected = country.value === value
                                        const countryFlag = getFlagUrl(country.value, country.label)
                                        return (
                                            <CommandItem
                                                key={country.value}
                                                onClick={() => {
                                                    onChange(country.value)
                                                    setOpen(false)
                                                    setQuery("")
                                                }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="h-10 w-14 overflow-hidden rounded border border-border">
                                                        {countryFlag ? (
                                                            <Image
                                                                src={countryFlag}
                                                                alt={`${country.label} flag`}
                                                                width={64}
                                                                height={48}
                                                                className="h-full w-full object-cover"
                                                                unoptimized
                                                                priority={false}
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                                                N/A
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-sm">{country.label}</span>
                                                </div>
                                                {isSelected && <Check className="h-4 w-4" />}
                                            </CommandItem>
                                        )
                                    })}
                                </CommandGroup>
                            )}
                        </CommandList>
                    </Command>
                </Popover.Content>
            </Popover.Root>
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    )
}
