"use client";

interface UnknownNamesAlertProps {
  unknownList: [string, number][];
}

export function UnknownNamesAlert({ unknownList }: UnknownNamesAlertProps) {
  return (
    <details className="group">
      <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
        <span className="group-open:rotate-90 transition-transform ">▶</span>
        {unknownList.length} unmapped names found
      </summary>
      <div className="mt-4 p-4 rounded-lg bg-muted/30 border">
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
      </div>
    </details>
  );
}
