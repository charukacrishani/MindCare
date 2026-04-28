export function PageHeader({ title, shortTitle, description }: { title: string; shortTitle?: string; description?: string }) {
    return (
        <div className="p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#980194]">{shortTitle}</p>
            {/* <h1 className="text-2xl font-semibold text-gray-900 mt-1">{title}</h1> */}
            <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
    );
}