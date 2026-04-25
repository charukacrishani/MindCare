export default function SpecializationChips({ specializations }: { specializations?: string }) {
    if (!specializations) {
        return null;
    }
    
    const parsedSpecialty = (() => {
        try {
            return Array.isArray(JSON.parse(specializations))
                ? JSON.parse(specializations)
                : [specializations];
        } catch {
            return [specializations];
        }
    })();

    return (
        <div className="flex flex-wrap gap-2">
            {parsedSpecialty.map((item: string, index: number) => (
                <span
                    key={item + index}
                    className="rounded-full border border-[#f0c3ee] bg-[#fff5ff] px-3 py-1 text-xs font-medium text-[#980194]"
                >
                    {item.replaceAll("_", " ").toLocaleUpperCase()}
                </span>
            ))}
        </div>
    )
}