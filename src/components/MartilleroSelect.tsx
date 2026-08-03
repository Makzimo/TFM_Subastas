interface MartilleroOption {
  id: string;
  name: string | null;
  email: string;
}

interface Props {
  martilleros: MartilleroOption[];
  defaultValue?: string;
  required?: boolean;
}

export function MartilleroSelect({
  martilleros,
  defaultValue,
  required = true,
}: Props) {
  return (
    <select
      id="martilleroId"
      name="martilleroId"
      required={required}
      defaultValue={defaultValue ?? ""}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="" disabled>
        Seleccione un martillero
      </option>
      {martilleros.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name || m.email}
        </option>
      ))}
    </select>
  );
}
