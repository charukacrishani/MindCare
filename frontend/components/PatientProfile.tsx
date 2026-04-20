import Image from "next/image";

interface Props {
  name: string;
  age: number;
  description: string;
  imageSrc: string;
}

export function PatientProfile({ name, age, description, imageSrc }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex gap-6">
      {/* Photo */}
      <div className="shrink-0 bg-gray-200 rounded-md">
        <Image
          src={imageSrc}
          alt={name}
          width={160}
          height={180}
          className="rounded-xl object-cover w-40 h-44"
        />
      </div>

      {/* Info */}
      <div className="flex flex-col justify-center gap-3">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{name}</h2>
          <p className="text-gray-400 text-sm mt-0.5">{age} years old</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 mb-1">Description</p>
          <p className="text-sm text-gray-600 leading-relaxed max-w-sm">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
