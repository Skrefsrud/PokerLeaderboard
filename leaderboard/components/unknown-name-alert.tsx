"use client";

interface UnknownNamesAlertProps {
  unknownList: [string, number][];
}

export function UnknownNamesAlert({ unknownList }: UnknownNamesAlertProps) {
  return (
    <section className="rounded-2xl border p-4 bg-yellow-50 text-yellow-900">
      <h2 className="text-lg font-semibold mb-2">Unmapped names found</h2>
      <p className="text-sm mb-2">
        Add these to <code>data/aliases.json</code> under the correct person
        (see README). The strings shown are <em>normalized</em> keys.
      </p>
      <ul className="text-sm list-disc pl-5">
        {unknownList.map(([name, count]) => (
          <li key={name}>
            <span className="font-mono">{name}</span> — {count} occurrence
            {count === 1 ? "" : "s"}
          </li>
        ))}
      </ul>
    </section>
  );
}
